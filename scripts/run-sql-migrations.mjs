/**
 * Run SQL migrations via DATABASE_URL (pg). Falls back gracefully when unset.
 * Prefer apply-premium-pricing.mjs on Vercel when only service role keys exist.
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("run-sql-migrations: skip (DATABASE_URL not set)");
    return;
  }

  await new Promise((resolve, reject) => {
    const child = spawn("node", [join(__dirname, "run-migrations.mjs")], {
      stdio: "inherit",
      env: process.env,
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`run-migrations.mjs exited with code ${code}`));
    });
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
