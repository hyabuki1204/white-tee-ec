# Supabase Setup

## 1. Run schema

In Supabase **SQL Editor**, paste and run:

```
supabase/schema.sql
```

## 2. Run seed

In the same SQL Editor, paste and run:

```
supabase/seed.sql
```

Safe to re-run — uses `ON CONFLICT` upserts.

## 3. Configure environment

Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://...
DATA_SOURCE=supabase
ADMIN_PASSWORD=your-team-password
```

Optional: `ADMIN_SESSION_SECRET` (falls back to `SUPABASE_SERVICE_ROLE_KEY`).

## 4. Run migrations

```powershell
npm run db:migrate
```

Applies every `supabase/migrations/*.sql` in filename order, once each (tracked in `public.schema_migrations`).

`gauge-lineup.sql` installs the current lineup — 3 gauges (28G / 36G / 46G) × 2 silhouettes (Regular / Box), sizes S / M / L — and unpublishes the previous products. Old products and fabrics are kept (orders and unpublished products reference them); the storefront only lists fabrics that have a published product.

Migrations are applied by production builds only. Preview builds skip them (see `scripts/run-sql-migrations.mjs`), so a branch that changes the catalog cannot switch the live storefront before it is merged.

**Vercel (production):** On each deploy, `postbuild` automatically:

1. Runs SQL migrations when `DATABASE_URL` is set — without it, new migrations (including the lineup) are **not** applied
2. Syncs prices via `SUPABASE_SERVICE_ROLE_KEY` (`scripts/apply-premium-pricing.mjs`); this only updates existing rows

Manual pricing sync: `npm run db:apply-pricing`

## 5. Restart dev server

```powershell
npm run dev
```

## 6. Verify storefront

- http://localhost:3000/products — 6 products from Supabase
- http://localhost:3000/products/46g-regular-tee — detail page
- Add to cart — product name resolves (same UUIDs as seed)

## 7. Admin product management

1. Set `ADMIN_PASSWORD` in `.env.local`
2. Open http://localhost:3000/admin/login
3. Manage products at http://localhost:3000/admin/products

Employees can create, edit, unpublish/delete products with:

- Name, slug, price, short + detail descriptions
- Material, care, fit note, size guide (cm table)
- Images (URL or upload to Supabase Storage `product-images` bucket)
- Sizes S/M/L with SKU and stock per variant
- Published / draft toggle

Products with order history are **unpublished** instead of hard-deleted.

## Data sync (mock fallback only)

When `DATA_SOURCE=mock`, product data comes from `lib/products/product-catalog.ts`.
With `DATA_SOURCE=supabase`, the database is the source of truth — use the admin UI.
