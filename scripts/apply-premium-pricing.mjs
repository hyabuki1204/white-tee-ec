/**
 * Apply premium pricing to Supabase products (idempotent).
 * Runs on Vercel postbuild when Supabase service role is configured.
 * Keep prices in sync with lib/products/pricing.ts
 */
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });
dotenv.config();

/** @type {Record<string, number>} */
const PRODUCT_PRICE_BY_SLUG = {
  "compact-cotton-tee": 12_000,
  "lightweight-pocket-tee": 13_000,
  "compact-cotton-tee-long-sleeve": 13_500,
  "relaxed-fit-tee": 14_000,
  "lightweight-pocket-tee-long-sleeve": 14_500,
  "short-sleeve-essential": 14_500,
  "heavyweight-crew-neck": 15_000,
  "box-fit-tee": 15_000,
  "relaxed-fit-tee-long-sleeve": 15_500,
  "long-sleeve-essential": 16_500,
  "heavyweight-crew-neck-long-sleeve": 17_000,
  "box-fit-tee-long-sleeve": 18_000,
};

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.log(
      "apply-premium-pricing: skip (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set)",
    );
    return;
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const slugs = Object.keys(PRODUCT_PRICE_BY_SLUG);
  const { data: rows, error: fetchError } = await supabase
    .from("products")
    .select("slug, price")
    .in("slug", slugs);

  if (fetchError) {
    throw new Error(`Failed to fetch products: ${fetchError.message}`);
  }

  const currentBySlug = Object.fromEntries(
    (rows ?? []).map((row) => [row.slug, row.price]),
  );

  let updated = 0;
  let skipped = 0;

  for (const [slug, price] of Object.entries(PRODUCT_PRICE_BY_SLUG)) {
    if (currentBySlug[slug] === price) {
      skipped += 1;
      continue;
    }

    const { error } = await supabase
      .from("products")
      .update({ price, updated_at: new Date().toISOString() })
      .eq("slug", slug);

    if (error) {
      throw new Error(`Failed to update ${slug}: ${error.message}`);
    }

    console.log(`apply-premium-pricing: ${slug} → ¥${price.toLocaleString("ja-JP")}`);
    updated += 1;
  }

  console.log(
    `apply-premium-pricing: done (${updated} updated, ${skipped} already correct)`,
  );
}

main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
});
