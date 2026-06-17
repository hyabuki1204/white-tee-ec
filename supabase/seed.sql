-- WHITE TEE EC — Seed data for products
-- Prerequisites: run supabase/schema.sql first
-- Run in Supabase SQL Editor (safe to re-run via ON CONFLICT)

-- ---------------------------------------------------------------------------
-- 1. fabrics
-- ---------------------------------------------------------------------------
insert into public.fabrics (slug, name, tagline, description_lines, image_url, image_alt, sort_order)
values
  ('heavyweight-jersey', 'Heavyweight Jersey', 'Dense cotton with structure.', '["Knit at a higher gauge for weight and body.", "The surface holds its shape —", "white reads clearly, without softness blur."]'::jsonb, '/fabric/heavyweight-jersey.jpg', 'Heavyweight white cotton jersey texture', 1),
  ('lightweight-jersey', 'Lightweight Jersey', 'Soft hand, open breath.', '["A lighter jersey for warmer days and closer contact.", "Fine yarn, relaxed tension —", "fabric that follows the skin without clinging."]'::jsonb, '/fabric/lightweight-jersey.jpg', 'Lightweight white cotton jersey texture', 2),
  ('relaxed-jersey', 'Relaxed Jersey', 'Room to move, quiet drape.', '["Medium weight with a softer fall.", "Built for ease —", "shoulders drop, lines soften, white stays calm."]'::jsonb, '/fabric/relaxed-jersey.jpg', 'Relaxed white cotton jersey texture', 3),
  ('compact-jersey', 'Compact Jersey', 'Tight weave for layering.', '["Compact yarn and a closer knit.", "Slim under a jacket, minimal under a shirt —", "structure without volume."]'::jsonb, '/fabric/compact-jersey.jpg', 'Compact white cotton jersey texture', 4),
  ('essential-jersey', 'Essential Jersey', 'The everyday weight.', '["Our baseline jersey — balanced, familiar, year-round.", "Neither heavy nor sheer —", "the cloth most days ask for."]'::jsonb, '/fabric/essential-jersey.jpg', 'Essential white cotton jersey texture', 5),
  ('box-jersey', 'Box Jersey', 'Substance without bulk.', '["A slightly denser hand with a flat, even surface.", "Straight lines need a cloth that keeps them —", "presence in white, without noise."]'::jsonb, '/fabric/box-jersey.jpg', 'Box white cotton jersey texture', 6)
on conflict (slug) do update set
  name = excluded.name,
  tagline = excluded.tagline,
  description_lines = excluded.description_lines,
  image_url = excluded.image_url,
  image_alt = excluded.image_alt,
  sort_order = excluded.sort_order,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- 2. products (12 items — ids match lib/products/product-catalog.ts)
-- ---------------------------------------------------------------------------
insert into public.products (
  id,
  slug,
  name,
  description,
  detail_description,
  fit_note,
  material,
  care,
  size_guide,
  is_published,
  price,
  fabric_slug
)
values
  (
    '10000000-0000-4000-8000-000000000001',
    'heavyweight-crew-neck',
    'Heavyweight Crew Neck',
    '厚手コットン100%。骨格のある白。',
    '厚手のコットン100%ジャージー。しっかりとした密度で、白の輪郭がはっきりと立つ一枚です。',
    'Regular fit',
    'COTTON 100%',
    'MACHINE WASH COLD WITH LIKE COLORS. DO NOT BLEACH. TUMBLE DRY LOW. COOL IRON IF NEEDED.',
    '[{"size":"S","length":68,"shoulder":44,"chest":52,"sleeve":20},{"size":"M","length":70,"shoulder":46,"chest":54,"sleeve":21},{"size":"L","length":72,"shoulder":48,"chest":56,"sleeve":22},{"size":"XL","length":74,"shoulder":50,"chest":58,"sleeve":23}]'::jsonb,
    true,
    8800,
    'heavyweight-jersey'
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'lightweight-pocket-tee',
    'Lightweight Pocket Tee',
    '軽やかな着心地。左胸ポケット付き。',
    '軽量なコットン100%。肌に沿うような柔らかさと、通気性のよい風合い。左胸のポケット付き。',
    'Regular fit',
    'COTTON 100%',
    'MACHINE WASH COLD WITH LIKE COLORS. DO NOT BLEACH. TUMBLE DRY LOW. COOL IRON IF NEEDED.',
    '[{"size":"S","length":68,"shoulder":44,"chest":52,"sleeve":20},{"size":"M","length":70,"shoulder":46,"chest":54,"sleeve":21},{"size":"L","length":72,"shoulder":48,"chest":56,"sleeve":22},{"size":"XL","length":74,"shoulder":50,"chest":58,"sleeve":23}]'::jsonb,
    true,
    7200,
    'lightweight-jersey'
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    'relaxed-fit-tee',
    'Relaxed Fit Tee',
    'ゆとりのあるシルエット。ドロップショルダー。',
    'ゆとりのあるシルエットとドロップショルダー。肩のラインを落とし、体のラインを強調しない着心地。',
    'Relaxed fit',
    'COTTON 100%',
    'MACHINE WASH COLD WITH LIKE COLORS. DO NOT BLEACH. TUMBLE DRY LOW. COOL IRON IF NEEDED.',
    '[{"size":"S","length":70,"shoulder":48,"chest":56,"sleeve":22},{"size":"M","length":72,"shoulder":50,"chest":58,"sleeve":23},{"size":"L","length":74,"shoulder":52,"chest":60,"sleeve":24},{"size":"XL","length":76,"shoulder":54,"chest":62,"sleeve":25}]'::jsonb,
    true,
    7900,
    'relaxed-jersey'
  ),
  (
    '10000000-0000-4000-8000-000000000004',
    'compact-cotton-tee',
    'Compact Cotton Tee',
    'コンパクトな身幅。レイヤード向き。',
    'コンパクトな身幅と短めの着丈。インナーとして重ねやすく、ジャケットの下にも余計なボリュームを出しません。',
    'Slim fit',
    'COTTON 100%',
    'MACHINE WASH COLD WITH LIKE COLORS. DO NOT BLEACH. TUMBLE DRY LOW. COOL IRON IF NEEDED.',
    '[{"size":"S","length":66,"shoulder":42,"chest":48,"sleeve":19},{"size":"M","length":68,"shoulder":44,"chest":50,"sleeve":20},{"size":"L","length":70,"shoulder":46,"chest":52,"sleeve":21},{"size":"XL","length":72,"shoulder":48,"chest":54,"sleeve":22}]'::jsonb,
    true,
    6500,
    'compact-jersey'
  ),
  (
    '10000000-0000-4000-8000-000000000005',
    'long-sleeve-essential',
    'Long Sleeve Essential',
    '長袖の定番。袖口はシンプルな仕上げ。',
    '長袖の定番Tシャツ。袖口はシンプルな仕上げで、季節を問わず白の質感を楽しめる一着です。',
    'Regular fit',
    'COTTON 100%',
    'MACHINE WASH COLD WITH LIKE COLORS. DO NOT BLEACH. TUMBLE DRY LOW. COOL IRON IF NEEDED.',
    '[{"size":"S","length":70,"shoulder":44,"chest":52,"sleeve":58},{"size":"M","length":72,"shoulder":46,"chest":54,"sleeve":59},{"size":"L","length":74,"shoulder":48,"chest":56,"sleeve":60},{"size":"XL","length":76,"shoulder":50,"chest":58,"sleeve":61}]'::jsonb,
    true,
    9800,
    'essential-jersey'
  ),
  (
    '10000000-0000-4000-8000-000000000006',
    'box-fit-tee',
    'Box Fit Tee',
    'ボックスシルエット。存在感のある白。',
    'ボックスシルエット。直線的なラインが、白の存在感を静かに引き立てます。',
    'Box fit',
    'COTTON 100%',
    'MACHINE WASH COLD WITH LIKE COLORS. DO NOT BLEACH. TUMBLE DRY LOW. COOL IRON IF NEEDED.',
    '[{"size":"S","length":70,"shoulder":48,"chest":56,"sleeve":22},{"size":"M","length":72,"shoulder":50,"chest":58,"sleeve":23},{"size":"L","length":74,"shoulder":52,"chest":60,"sleeve":24},{"size":"XL","length":76,"shoulder":54,"chest":62,"sleeve":25}]'::jsonb,
    true,
    8400,
    'box-jersey'
  )
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  detail_description = excluded.detail_description,
  fit_note = excluded.fit_note,
  material = excluded.material,
  care = excluded.care,
  size_guide = excluded.size_guide,
  is_published = excluded.is_published,
  price = excluded.price,
  fabric_slug = excluded.fabric_slug,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- 2. product_images (3 images per product — front / fabric / back)
-- ---------------------------------------------------------------------------
insert into public.product_images (id, product_id, url, sort_order, is_primary)
values
  (
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    '/products/heavyweight-crew-neck-01.jpg',
    0,
    true
  ),
  (
    '20000000-0000-4000-8000-000000000011',
    '10000000-0000-4000-8000-000000000001',
    '/products/heavyweight-crew-neck-02.jpg',
    1,
    false
  ),
  (
    '20000000-0000-4000-8000-000000000021',
    '10000000-0000-4000-8000-000000000001',
    '/products/heavyweight-crew-neck-03.jpg',
    2,
    false
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000002',
    '/products/lightweight-pocket-tee-01.jpg',
    0,
    true
  ),
  (
    '20000000-0000-4000-8000-000000000012',
    '10000000-0000-4000-8000-000000000002',
    '/products/lightweight-pocket-tee-02.jpg',
    1,
    false
  ),
  (
    '20000000-0000-4000-8000-000000000022',
    '10000000-0000-4000-8000-000000000002',
    '/products/lightweight-pocket-tee-03.jpg',
    2,
    false
  ),
  (
    '20000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000003',
    '/products/relaxed-fit-tee-01.jpg',
    0,
    true
  ),
  (
    '20000000-0000-4000-8000-000000000013',
    '10000000-0000-4000-8000-000000000003',
    '/products/relaxed-fit-tee-02.jpg',
    1,
    false
  ),
  (
    '20000000-0000-4000-8000-000000000023',
    '10000000-0000-4000-8000-000000000003',
    '/products/relaxed-fit-tee-03.jpg',
    2,
    false
  ),
  (
    '20000000-0000-4000-8000-000000000004',
    '10000000-0000-4000-8000-000000000004',
    '/products/compact-cotton-tee-01.jpg',
    0,
    true
  ),
  (
    '20000000-0000-4000-8000-000000000014',
    '10000000-0000-4000-8000-000000000004',
    '/products/compact-cotton-tee-02.jpg',
    1,
    false
  ),
  (
    '20000000-0000-4000-8000-000000000024',
    '10000000-0000-4000-8000-000000000004',
    '/products/compact-cotton-tee-03.jpg',
    2,
    false
  ),
  (
    '20000000-0000-4000-8000-000000000005',
    '10000000-0000-4000-8000-000000000005',
    '/products/long-sleeve-essential-01.jpg',
    0,
    true
  ),
  (
    '20000000-0000-4000-8000-000000000015',
    '10000000-0000-4000-8000-000000000005',
    '/products/long-sleeve-essential-02.jpg',
    1,
    false
  ),
  (
    '20000000-0000-4000-8000-000000000025',
    '10000000-0000-4000-8000-000000000005',
    '/products/long-sleeve-essential-03.jpg',
    2,
    false
  ),
  (
    '20000000-0000-4000-8000-000000000006',
    '10000000-0000-4000-8000-000000000006',
    '/products/box-fit-tee-01.jpg',
    0,
    true
  ),
  (
    '20000000-0000-4000-8000-000000000016',
    '10000000-0000-4000-8000-000000000006',
    '/products/box-fit-tee-02.jpg',
    1,
    false
  ),
  (
    '20000000-0000-4000-8000-000000000026',
    '10000000-0000-4000-8000-000000000006',
    '/products/box-fit-tee-03.jpg',
    2,
    false
  )
on conflict (id) do update set
  url = excluded.url,
  sort_order = excluded.sort_order,
  is_primary = excluded.is_primary;

-- ---------------------------------------------------------------------------
-- 3. product_variants (S / M / L / XL for each product)
-- ---------------------------------------------------------------------------
insert into public.product_variants (id, product_id, size, sku, stock_quantity)
values
  -- WT-001 Heavyweight Crew Neck
  ('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'S',  'WT-001-S',  10),
  ('30000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'M',  'WT-001-M',  20),
  ('30000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001', 'L',  'WT-001-L',  15),
  ('30000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000001', 'XL', 'WT-001-XL',  8),

  -- WT-002 Lightweight Pocket Tee
  ('30000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000002', 'S',  'WT-002-S',  12),
  ('30000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000002', 'M',  'WT-002-M',  25),
  ('30000000-0000-4000-8000-000000000007', '10000000-0000-4000-8000-000000000002', 'L',  'WT-002-L',  18),
  ('30000000-0000-4000-8000-000000000008', '10000000-0000-4000-8000-000000000002', 'XL', 'WT-002-XL',  6),

  -- WT-003 Relaxed Fit Tee
  ('30000000-0000-4000-8000-000000000009',  '10000000-0000-4000-8000-000000000003', 'S',  'WT-003-S',  14),
  ('30000000-0000-4000-8000-000000000010', '10000000-0000-4000-8000-000000000003', 'M',  'WT-003-M',  22),
  ('30000000-0000-4000-8000-000000000011', '10000000-0000-4000-8000-000000000003', 'L',  'WT-003-L',  16),
  ('30000000-0000-4000-8000-000000000012', '10000000-0000-4000-8000-000000000003', 'XL', 'WT-003-XL',  5),

  -- WT-004 Compact Cotton Tee
  ('30000000-0000-4000-8000-000000000013', '10000000-0000-4000-8000-000000000004', 'S',  'WT-004-S',  30),
  ('30000000-0000-4000-8000-000000000014', '10000000-0000-4000-8000-000000000004', 'M',  'WT-004-M',  40),
  ('30000000-0000-4000-8000-000000000015', '10000000-0000-4000-8000-000000000004', 'L',  'WT-004-L',  20),
  ('30000000-0000-4000-8000-000000000016', '10000000-0000-4000-8000-000000000004', 'XL', 'WT-004-XL', 10),

  -- WT-005 Long Sleeve Essential
  ('30000000-0000-4000-8000-000000000017', '10000000-0000-4000-8000-000000000005', 'S',  'WT-005-S',  8),
  ('30000000-0000-4000-8000-000000000018', '10000000-0000-4000-8000-000000000005', 'M',  'WT-005-M',  15),
  ('30000000-0000-4000-8000-000000000019', '10000000-0000-4000-8000-000000000005', 'L',  'WT-005-L',  12),
  ('30000000-0000-4000-8000-000000000020', '10000000-0000-4000-8000-000000000005', 'XL', 'WT-005-XL',  4),

  -- WT-006 Box Fit Tee
  ('30000000-0000-4000-8000-000000000021', '10000000-0000-4000-8000-000000000006', 'S',  'WT-006-S',  11),
  ('30000000-0000-4000-8000-000000000022', '10000000-0000-4000-8000-000000000006', 'M',  'WT-006-M',  19),
  ('30000000-0000-4000-8000-000000000023', '10000000-0000-4000-8000-000000000006', 'L',  'WT-006-L',  13),
  ('30000000-0000-4000-8000-000000000024', '10000000-0000-4000-8000-000000000006', 'XL', 'WT-006-XL',  7)
on conflict (product_id, size) do update set
  sku = excluded.sku,
  stock_quantity = excluded.stock_quantity;

-- WT-007 … WT-012: run supabase/migrations/add-twelve-sku-expansion.sql
-- (or npm run db:migrate) to add 6 new products on existing databases.

-- ---------------------------------------------------------------------------
-- Verify (optional — run separately)
-- ---------------------------------------------------------------------------
-- select p.slug, p.name, p.price, pi.url, pv.size, pv.sku, pv.stock_quantity
-- from public.products p
-- left join public.product_images pi on pi.product_id = p.id and pi.is_primary = true
-- left join public.product_variants pv on pv.product_id = p.id
-- order by p.slug, pv.size;
