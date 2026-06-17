-- Expand catalog from 6 to 12 SKUs (6 fabrics × short + long sleeve)
-- Run after schema + prior migrations. Safe to re-run (ON CONFLICT).

-- ---------------------------------------------------------------------------
-- New products WT-007 … WT-012
-- ---------------------------------------------------------------------------
insert into public.products (
  id, slug, name, description, detail_description, fit_note,
  material, care, size_guide, is_published, price, fabric_slug,
  sleeve_type, fit_type
)
values
  (
    '10000000-0000-4000-8000-000000000007',
    'short-sleeve-essential',
    'Short Sleeve Essential',
    'Essential Jerseyの半袖定番。一年中着られる一枚。',
    'Essential Jerseyの半袖定番。バランスの取れた身幅と、一年中着られる標準的な着丈です。',
    'Regular fit',
    'COTTON 100%',
    'MACHINE WASH COLD WITH LIKE COLORS. DO NOT BLEACH. TUMBLE DRY LOW. COOL IRON IF NEEDED.',
    '[{"size":"S","length":68,"shoulder":44,"chest":52,"sleeve":20},{"size":"M","length":70,"shoulder":46,"chest":54,"sleeve":21},{"size":"L","length":72,"shoulder":48,"chest":56,"sleeve":22},{"size":"XL","length":74,"shoulder":50,"chest":58,"sleeve":23}]'::jsonb,
    true, 8800, 'essential-jersey', 'short', 'regular'
  ),
  (
    '10000000-0000-4000-8000-000000000008',
    'heavyweight-crew-neck-long-sleeve',
    'Heavyweight Crew Neck Long Sleeve',
    'Heavyweight Jerseyの長袖版。密度のある白。',
    'Heavyweight Jerseyの長袖版。厚手の密度を保ちながら、袖丈を延ばした冬向けの一枚です。',
    'Regular fit',
    'COTTON 100%',
    'MACHINE WASH COLD WITH LIKE COLORS. DO NOT BLEACH. TUMBLE DRY LOW. COOL IRON IF NEEDED.',
    '[{"size":"S","length":68,"shoulder":44,"chest":52,"sleeve":58},{"size":"M","length":70,"shoulder":46,"chest":54,"sleeve":59},{"size":"L","length":72,"shoulder":48,"chest":56,"sleeve":60},{"size":"XL","length":74,"shoulder":50,"chest":58,"sleeve":61}]'::jsonb,
    true, 9800, 'heavyweight-jersey', 'long', 'regular'
  ),
  (
    '10000000-0000-4000-8000-000000000009',
    'lightweight-pocket-tee-long-sleeve',
    'Lightweight Pocket Tee Long Sleeve',
    '軽やかな長袖ポケットT。通気性のよい風合い。',
    'Lightweight Jerseyの長袖ポケットT。軽やかな風合いと左胸ポケットを、長袖シルエットで。',
    'Regular fit',
    'COTTON 100%',
    'MACHINE WASH COLD WITH LIKE COLORS. DO NOT BLEACH. TUMBLE DRY LOW. COOL IRON IF NEEDED.',
    '[{"size":"S","length":70,"shoulder":44,"chest":52,"sleeve":58},{"size":"M","length":72,"shoulder":46,"chest":54,"sleeve":59},{"size":"L","length":74,"shoulder":48,"chest":56,"sleeve":60},{"size":"XL","length":76,"shoulder":50,"chest":58,"sleeve":61}]'::jsonb,
    true, 8200, 'lightweight-jersey', 'long', 'regular'
  ),
  (
    '10000000-0000-4000-8000-000000000010',
    'relaxed-fit-tee-long-sleeve',
    'Relaxed Fit Tee Long Sleeve',
    'Relaxed Jerseyの長袖版。ゆとりのあるドレープ。',
    'Relaxed Jerseyの長袖版。ドロップショルダーとゆとりのあるラインを、長袖で楽しめる一着。',
    'Relaxed fit',
    'COTTON 100%',
    'MACHINE WASH COLD WITH LIKE COLORS. DO NOT BLEACH. TUMBLE DRY LOW. COOL IRON IF NEEDED.',
    '[{"size":"S","length":70,"shoulder":48,"chest":56,"sleeve":58},{"size":"M","length":72,"shoulder":50,"chest":58,"sleeve":59},{"size":"L","length":74,"shoulder":52,"chest":60,"sleeve":60},{"size":"XL","length":76,"shoulder":54,"chest":62,"sleeve":61}]'::jsonb,
    true, 8900, 'relaxed-jersey', 'long', 'relaxed'
  ),
  (
    '10000000-0000-4000-8000-000000000011',
    'compact-cotton-tee-long-sleeve',
    'Compact Cotton Tee Long Sleeve',
    'Compact Jerseyの長袖版。スリムなレイヤード向き。',
    'Compact Jerseyの長袖版。コンパクトな身幅のまま、レイヤード向きの長袖シルエット。',
    'Slim fit',
    'COTTON 100%',
    'MACHINE WASH COLD WITH LIKE COLORS. DO NOT BLEACH. TUMBLE DRY LOW. COOL IRON IF NEEDED.',
    '[{"size":"S","length":66,"shoulder":42,"chest":48,"sleeve":58},{"size":"M","length":68,"shoulder":44,"chest":50,"sleeve":59},{"size":"L","length":70,"shoulder":46,"chest":52,"sleeve":60},{"size":"XL","length":72,"shoulder":48,"chest":54,"sleeve":61}]'::jsonb,
    true, 7500, 'compact-jersey', 'long', 'slim'
  ),
  (
    '10000000-0000-4000-8000-000000000012',
    'box-fit-tee-long-sleeve',
    'Box Fit Tee Long Sleeve',
    'Box Jerseyの長袖版。直線的なボックスシルエット。',
    'Box Jerseyの長袖版。ボックスシルエットの直線を、長袖でより静かに際立たせます。',
    'Box fit',
    'COTTON 100%',
    'MACHINE WASH COLD WITH LIKE COLORS. DO NOT BLEACH. TUMBLE DRY LOW. COOL IRON IF NEEDED.',
    '[{"size":"S","length":70,"shoulder":48,"chest":56,"sleeve":58},{"size":"M","length":72,"shoulder":50,"chest":58,"sleeve":59},{"size":"L","length":74,"shoulder":52,"chest":60,"sleeve":60},{"size":"XL","length":76,"shoulder":54,"chest":62,"sleeve":61}]'::jsonb,
    true, 9400, 'box-jersey', 'long', 'boxy'
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
  sleeve_type = excluded.sleeve_type,
  fit_type = excluded.fit_type,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- Product images (5 per new SKU: flat / macro / back / model / model alt)
-- ---------------------------------------------------------------------------
insert into public.product_images (id, product_id, url, sort_order, is_primary, is_card_hover)
values
  ('20000000-0000-4000-8000-000000000031', '10000000-0000-4000-8000-000000000007', '/products/short-sleeve-essential-01.jpg', 0, true, false),
  ('20000000-0000-4000-8000-000000000032', '10000000-0000-4000-8000-000000000007', '/products/short-sleeve-essential-02.jpg', 1, false, false),
  ('20000000-0000-4000-8000-000000000033', '10000000-0000-4000-8000-000000000007', '/products/short-sleeve-essential-03.jpg', 2, false, false),
  ('20000000-0000-4000-8000-000000000034', '10000000-0000-4000-8000-000000000007', '/products/short-sleeve-essential-04.jpg', 3, false, true),
  ('20000000-0000-4000-8000-000000000035', '10000000-0000-4000-8000-000000000007', '/products/short-sleeve-essential-05.jpg', 4, false, false),

  ('20000000-0000-4000-8000-000000000041', '10000000-0000-4000-8000-000000000008', '/products/heavyweight-crew-neck-long-sleeve-01.jpg', 0, true, false),
  ('20000000-0000-4000-8000-000000000042', '10000000-0000-4000-8000-000000000008', '/products/heavyweight-crew-neck-long-sleeve-02.jpg', 1, false, false),
  ('20000000-0000-4000-8000-000000000043', '10000000-0000-4000-8000-000000000008', '/products/heavyweight-crew-neck-long-sleeve-03.jpg', 2, false, false),
  ('20000000-0000-4000-8000-000000000044', '10000000-0000-4000-8000-000000000008', '/products/heavyweight-crew-neck-long-sleeve-04.jpg', 3, false, true),
  ('20000000-0000-4000-8000-000000000045', '10000000-0000-4000-8000-000000000008', '/products/heavyweight-crew-neck-long-sleeve-05.jpg', 4, false, false),

  ('20000000-0000-4000-8000-000000000051', '10000000-0000-4000-8000-000000000009', '/products/lightweight-pocket-tee-long-sleeve-01.jpg', 0, true, false),
  ('20000000-0000-4000-8000-000000000052', '10000000-0000-4000-8000-000000000009', '/products/lightweight-pocket-tee-long-sleeve-02.jpg', 1, false, false),
  ('20000000-0000-4000-8000-000000000053', '10000000-0000-4000-8000-000000000009', '/products/lightweight-pocket-tee-long-sleeve-03.jpg', 2, false, false),
  ('20000000-0000-4000-8000-000000000054', '10000000-0000-4000-8000-000000000009', '/products/lightweight-pocket-tee-long-sleeve-04.jpg', 3, false, true),
  ('20000000-0000-4000-8000-000000000055', '10000000-0000-4000-8000-000000000009', '/products/lightweight-pocket-tee-long-sleeve-05.jpg', 4, false, false),

  ('20000000-0000-4000-8000-000000000061', '10000000-0000-4000-8000-000000000010', '/products/relaxed-fit-tee-long-sleeve-01.jpg', 0, true, false),
  ('20000000-0000-4000-8000-000000000062', '10000000-0000-4000-8000-000000000010', '/products/relaxed-fit-tee-long-sleeve-02.jpg', 1, false, false),
  ('20000000-0000-4000-8000-000000000063', '10000000-0000-4000-8000-000000000010', '/products/relaxed-fit-tee-long-sleeve-03.jpg', 2, false, false),
  ('20000000-0000-4000-8000-000000000064', '10000000-0000-4000-8000-000000000010', '/products/relaxed-fit-tee-long-sleeve-04.jpg', 3, false, true),
  ('20000000-0000-4000-8000-000000000065', '10000000-0000-4000-8000-000000000010', '/products/relaxed-fit-tee-long-sleeve-05.jpg', 4, false, false),

  ('20000000-0000-4000-8000-000000000071', '10000000-0000-4000-8000-000000000011', '/products/compact-cotton-tee-long-sleeve-01.jpg', 0, true, false),
  ('20000000-0000-4000-8000-000000000072', '10000000-0000-4000-8000-000000000011', '/products/compact-cotton-tee-long-sleeve-02.jpg', 1, false, false),
  ('20000000-0000-4000-8000-000000000073', '10000000-0000-4000-8000-000000000011', '/products/compact-cotton-tee-long-sleeve-03.jpg', 2, false, false),
  ('20000000-0000-4000-8000-000000000074', '10000000-0000-4000-8000-000000000011', '/products/compact-cotton-tee-long-sleeve-04.jpg', 3, false, true),
  ('20000000-0000-4000-8000-000000000075', '10000000-0000-4000-8000-000000000011', '/products/compact-cotton-tee-long-sleeve-05.jpg', 4, false, false),

  ('20000000-0000-4000-8000-000000000081', '10000000-0000-4000-8000-000000000012', '/products/box-fit-tee-long-sleeve-01.jpg', 0, true, false),
  ('20000000-0000-4000-8000-000000000082', '10000000-0000-4000-8000-000000000012', '/products/box-fit-tee-long-sleeve-02.jpg', 1, false, false),
  ('20000000-0000-4000-8000-000000000083', '10000000-0000-4000-8000-000000000012', '/products/box-fit-tee-long-sleeve-03.jpg', 2, false, false),
  ('20000000-0000-4000-8000-000000000084', '10000000-0000-4000-8000-000000000012', '/products/box-fit-tee-long-sleeve-04.jpg', 3, false, true),
  ('20000000-0000-4000-8000-000000000085', '10000000-0000-4000-8000-000000000012', '/products/box-fit-tee-long-sleeve-05.jpg', 4, false, false)
on conflict (id) do update set
  url = excluded.url,
  sort_order = excluded.sort_order,
  is_primary = excluded.is_primary,
  is_card_hover = excluded.is_card_hover;

-- ---------------------------------------------------------------------------
-- Variants
-- ---------------------------------------------------------------------------
insert into public.product_variants (id, product_id, size, sku, stock_quantity)
values
  ('30000000-0000-4000-8000-000000000025', '10000000-0000-4000-8000-000000000007', 'S',  'WT-007-S',  10),
  ('30000000-0000-4000-8000-000000000026', '10000000-0000-4000-8000-000000000007', 'M',  'WT-007-M',  18),
  ('30000000-0000-4000-8000-000000000027', '10000000-0000-4000-8000-000000000007', 'L',  'WT-007-L',  14),
  ('30000000-0000-4000-8000-000000000028', '10000000-0000-4000-8000-000000000007', 'XL', 'WT-007-XL',  6),

  ('30000000-0000-4000-8000-000000000029', '10000000-0000-4000-8000-000000000008', 'S',  'WT-008-S',  9),
  ('30000000-0000-4000-8000-000000000030', '10000000-0000-4000-8000-000000000008', 'M',  'WT-008-M',  16),
  ('30000000-0000-4000-8000-000000000031', '10000000-0000-4000-8000-000000000008', 'L',  'WT-008-L',  12),
  ('30000000-0000-4000-8000-000000000032', '10000000-0000-4000-8000-000000000008', 'XL', 'WT-008-XL',  5),

  ('30000000-0000-4000-8000-000000000033', '10000000-0000-4000-8000-000000000009', 'S',  'WT-009-S',  11),
  ('30000000-0000-4000-8000-000000000034', '10000000-0000-4000-8000-000000000009', 'M',  'WT-009-M',  20),
  ('30000000-0000-4000-8000-000000000035', '10000000-0000-4000-8000-000000000009', 'L',  'WT-009-L',  15),
  ('30000000-0000-4000-8000-000000000036', '10000000-0000-4000-8000-000000000009', 'XL', 'WT-009-XL',  5),

  ('30000000-0000-4000-8000-000000000037', '10000000-0000-4000-8000-000000000010', 'S',  'WT-010-S',  10),
  ('30000000-0000-4000-8000-000000000038', '10000000-0000-4000-8000-000000000010', 'M',  'WT-010-M',  18),
  ('30000000-0000-4000-8000-000000000039', '10000000-0000-4000-8000-000000000010', 'L',  'WT-010-L',  13),
  ('30000000-0000-4000-8000-000000000040', '10000000-0000-4000-8000-000000000010', 'XL', 'WT-010-XL',  4),

  ('30000000-0000-4000-8000-000000000041', '10000000-0000-4000-8000-000000000011', 'S',  'WT-011-S',  14),
  ('30000000-0000-4000-8000-000000000042', '10000000-0000-4000-8000-000000000011', 'M',  'WT-011-M',  22),
  ('30000000-0000-4000-8000-000000000043', '10000000-0000-4000-8000-000000000011', 'L',  'WT-011-L',  16),
  ('30000000-0000-4000-8000-000000000044', '10000000-0000-4000-8000-000000000011', 'XL', 'WT-011-XL',  8),

  ('30000000-0000-4000-8000-000000000045', '10000000-0000-4000-8000-000000000012', 'S',  'WT-012-S',  9),
  ('30000000-0000-4000-8000-000000000046', '10000000-0000-4000-8000-000000000012', 'M',  'WT-012-M',  17),
  ('30000000-0000-4000-8000-000000000047', '10000000-0000-4000-8000-000000000012', 'L',  'WT-012-L',  12),
  ('30000000-0000-4000-8000-000000000048', '10000000-0000-4000-8000-000000000012', 'XL', 'WT-012-XL',  5)
on conflict (product_id, size) do update set
  sku = excluded.sku,
  stock_quantity = excluded.stock_quantity;

-- Backfill sleeve/fit on original 6 (idempotent)
update public.products set sleeve_type = 'short', fit_type = 'regular' where slug = 'heavyweight-crew-neck';
update public.products set sleeve_type = 'short', fit_type = 'regular' where slug = 'lightweight-pocket-tee';
update public.products set sleeve_type = 'short', fit_type = 'relaxed' where slug = 'relaxed-fit-tee';
update public.products set sleeve_type = 'short', fit_type = 'slim' where slug = 'compact-cotton-tee';
update public.products set sleeve_type = 'long', fit_type = 'regular' where slug = 'long-sleeve-essential';
update public.products set sleeve_type = 'short', fit_type = 'boxy' where slug = 'box-fit-tee';
