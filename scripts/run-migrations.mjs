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

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

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
