import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: ".env.local" });

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const shipping = await client.query(
  "SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'shipping_address'",
);
const buckets = await client.query(
  "SELECT id FROM storage.buckets WHERE id IN ('site-images', 'product-images')",
);
const keys = await client.query(
  "SELECT conname FROM pg_constraint WHERE conrelid = 'public.site_content'::regclass AND contype = 'c'",
);

console.log(JSON.stringify({
  shippingAddress: shipping.rowCount > 0,
  buckets: buckets.rows.map((row) => row.id),
  siteContentConstraints: keys.rows.map((row) => row.conname),
}, null, 2));

await client.end();
