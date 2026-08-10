/**
 * Print pipeline state straight from the database.
 *
 *   npm run images:status
 *   npm run images:status -- --brief <id>
 *
 * Reads via DATABASE_URL rather than the app, so it still works when the
 * dev server is down — which is exactly when you want to look.
 */
import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: ".env.local" });
dotenv.config();

function parseArgs(argv = process.argv.slice(2)) {
  const values = {};

  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i].startsWith("--") && argv[i + 1] && !argv[i + 1].startsWith("--")) {
      values[argv[i].slice(2)] = argv[i + 1];
      i += 1;
    }
  }

  return values;
}

function table(rows, columns) {
  if (rows.length === 0) {
    console.log("  (none)");
    return;
  }

  const widths = columns.map((col) =>
    Math.max(col.length, ...rows.map((row) => String(row[col] ?? "").length)),
  );

  console.log(
    "  " + columns.map((col, i) => col.padEnd(widths[i])).join("  "),
  );
  console.log("  " + widths.map((w) => "-".repeat(w)).join("  "));

  for (const row of rows) {
    console.log(
      "  " +
        columns
          .map((col, i) => String(row[col] ?? "").padEnd(widths[i]))
          .join("  "),
    );
  }
}

async function main() {
  const args = parseArgs();

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Add it to .env.local.");
    process.exit(1);
  }

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    const briefFilter = args.brief ? "where b.id = $1" : "";
    const params = args.brief ? [args.brief] : [];

    console.log("\nBriefs");
    const briefs = await client.query(
      `select b.title, b.purpose, b.subject_class, b.release_policy,
              count(distinct c.id)::int as concepts
       from image_briefs b
       left join image_concepts c on c.brief_id = b.id
       ${briefFilter}
       group by b.id
       order by b.created_at desc
       limit 20`,
      params,
    );
    table(briefs.rows, [
      "title",
      "purpose",
      "subject_class",
      "release_policy",
      "concepts",
    ]);

    console.log("\nJobs by status");
    const jobs = await client.query(
      `select j.status, count(*)::int as count,
              sum(j.attempt_count)::int as attempts
       from image_generation_jobs j
       group by j.status
       order by count desc`,
    );
    table(jobs.rows, ["status", "count", "attempts"]);

    console.log("\nResults by review state");
    const results = await client.query(
      `select r.review_state, count(*)::int as count,
              count(r.download_error) filter (where r.download_error is not null)::int as failed_downloads
       from image_generation_results r
       group by r.review_state
       order by count desc`,
    );
    table(results.rows, ["review_state", "count", "failed_downloads"]);

    console.log("\nMonth-to-date spend");
    const spend = await client.query(
      `select kind, round(sum(amount_jpy))::int as jpy
       from image_cost_ledger
       where occurred_at >= date_trunc('month', now())
       group by kind`,
    );
    table(spend.rows, ["kind", "jpy"]);

    const total = spend.rows.reduce((sum, row) => sum + Number(row.jpy), 0);
    const limit = Number(process.env.IMAGE_MONTHLY_BUDGET_JPY ?? 20000);
    const pct = limit === 0 ? 0 : Math.round((total / limit) * 100);
    console.log(`\n  total ${total} / ${limit} JPY (${pct}%)`);

    const recentErrors = await client.query(
      `select j.error_category, j.error_code, j.error_message
       from image_generation_jobs j
       where j.error_message is not null
       order by j.updated_at desc
       limit 5`,
    );

    if (recentErrors.rows.length > 0) {
      console.log("\nRecent errors");
      table(recentErrors.rows, [
        "error_category",
        "error_code",
        "error_message",
      ]);
    }

    console.log("");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
