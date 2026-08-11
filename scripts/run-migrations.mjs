import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: ".env.local" });
dotenv.config();

const { Client } = pg;

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.schema_migrations (
      name text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    );
  `);
}

async function isApplied(client, name) {
  const result = await client.query(
    "SELECT 1 FROM public.schema_migrations WHERE name = $1",
    [name],
  );

  return result.rowCount > 0;
}

async function markApplied(client, name) {
  await client.query(
    "INSERT INTO public.schema_migrations (name) VALUES ($1)",
    [name],
  );
}

/**
 * Describe a connection string without ever revealing the password.
 *
 * "password authentication failed" on its own is a dead end when the only
 * way to test a change is to burn another deploy. Everything below is
 * derived from the URL as parsed, so it shows what the server actually
 * received rather than what was intended — which is where the difference
 * usually hides.
 */
function inspectConnectionString(raw) {
  const notes = [];

  if (raw !== raw.trim()) {
    notes.push("! value has leading or trailing whitespace/newline");
  }

  const trimmed = raw.trim();
  const schemeEnd = trimmed.indexOf("://");

  if (schemeEnd === -1) {
    notes.push("! could not be parsed as a postgres:// URL");
    return notes;
  }

  const rest = trimmed.slice(schemeEnd + 3);
  const authorityEnd = rest.search(/[/?]/);
  const authority = authorityEnd === -1 ? rest : rest.slice(0, authorityEnd);
  const tail = authorityEnd === -1 ? "" : rest.slice(authorityEnd);

  // Split on the LAST "@" in the authority, which is what pg does. Splitting
  // on the first one would misreport the host whenever the password itself
  // contains an unencoded "@" — exactly the case worth diagnosing.
  const atIndex = authority.lastIndexOf("@");
  const userinfo = atIndex === -1 ? "" : authority.slice(0, atIndex);
  const hostPort = atIndex === -1 ? authority : authority.slice(atIndex + 1);
  const colonIndex = userinfo.indexOf(":");
  const user = colonIndex === -1 ? userinfo : userinfo.slice(0, colonIndex);
  const password = colonIndex === -1 ? "" : userinfo.slice(colonIndex + 1);
  const portMatch = /:(\d+)$/.exec(hostPort);
  const host = portMatch ? hostPort.slice(0, portMatch.index) : hostPort;
  const port = portMatch ? portMatch[1] : "(default 5432)";
  const database = tail.replace(/^\//, "").replace(/\?.*$/, "");

  notes.push(`user:     ${user}`);
  notes.push(`host:     ${host}`);
  notes.push(`port:     ${port}`);
  notes.push(`database: ${database}`);
  notes.push(`password: ${password.length} characters (value not shown)`);

  if (password.length === 0) {
    notes.push("! password is empty");
  }

  if (/^\[.*\]$/.test(password)) {
    notes.push("! password is still wrapped in [ ] — remove the brackets");
  }

  // These end the password early when the URL is parsed, so the server sees
  // a truncated value and rejects it. They must be percent-encoded.
  const risky = ["#", "?", "/", "%", "[", "]", " "].filter((c) =>
    password.includes(c),
  );

  if (risky.length > 0) {
    notes.push(
      `! password contains ${risky.map((c) => `"${c}"`).join(", ")} — ` +
        "percent-encode these or the password is cut short",
    );
  }

  const atCount = (trimmed.match(/@/g) || []).length;

  if (atCount > 1) {
    notes.push(
      `! the URL contains ${atCount} "@" characters — if one is inside the ` +
        'password it must be written as %40',
    );
  }

  return notes;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error(
      [
        "DATABASE_URL is not set.",
        "",
        "Add it to .env.local once:",
        "  Supabase Dashboard → Project Settings → Database → Connection string (URI)",
        "",
        "Example:",
        "  DATABASE_URL=postgresql://postgres.[ref]:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres",
      ].join("\n"),
    );
    process.exit(1);
  }

  const migrationsDir = join(process.cwd(), "supabase", "migrations");
  const files = readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("No migration files found.");
    return;
  }

  let client;

  try {
    // Construction parses the URL, so a malformed one throws here — before
    // any connection is attempted — with a message as unhelpful as
    // "Invalid URL". The diagnostic below is the whole point of catching it.
    client = new Client({ connectionString: databaseUrl });
    await client.connect();
  } catch (error) {
    console.error(
      [
        "",
        "Could not connect using DATABASE_URL.",
        `  ${error instanceof Error ? error.message : error}`,
        "",
        "DATABASE_URL as parsed (password never printed):",
        ...inspectConnectionString(databaseUrl).map((line) => `  ${line}`),
        "",
        error?.code === "28P01"
          ? [
              "28P01 means the server was reached and rejected the password,",
              "so the host and port are fine — only the password is wrong.",
              "Supabase never shows this password again; look for an existing",
              "connection string in whatever already connects to this project",
              "(Railway variables, another Vercel project, a local .env.local)",
              "rather than resetting it, which would break those.",
            ].join("\n")
          : "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
    process.exit(1);
  }

  try {
    await ensureMigrationsTable(client);

    for (const file of files) {
      if (await isApplied(client, file)) {
        console.log(`skip  ${file}`);
        continue;
      }

      const sql = readFileSync(join(migrationsDir, file), "utf8");
      console.log(`apply ${file}`);

      await client.query("BEGIN");

      try {
        await client.query(sql);
        await markApplied(client, file);
        await client.query("COMMIT");
        console.log(`done  ${file}`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }

    console.log("All migrations up to date.");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
