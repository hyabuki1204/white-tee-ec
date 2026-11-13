-- Gauge lineup: 3 gauges (28G / 36G / 46G) × 2 silhouettes (Regular / Box)
-- = 6 products, sizes S / M / L (18 SKUs). Replaces the 6-fabric × 2-sleeve lineup.
--
-- Values mirror lib/products/product-catalog.ts, product-details.ts,
-- fit-profiles.ts, pricing.ts and lib/fabric/content.ts — keep in sync.
--
-- Idempotent (ON CONFLICT / guarded updates). Re-running resets the six
-- products, their four catalog images and their SKUs to the values below;
-- stock is only set when a variant row is first created.
-- Nothing is deleted that an order could reference.

-- ---------------------------------------------------------------------------
-- 1. Fabrics — one per gauge
-- ---------------------------------------------------------------------------
insert into public.fabrics (
  slug, name, tagline, description_lines, image_url, image_alt, sort_order,
  character_thickness, character_softness, character_structure, character_sheerness, character_surface
)
values
  (
    '28g-jersey', '28G Jersey', 'Thick. Holds its line.',
    '["Two-ply combed yarn, knit tight at 28 gauge.","240 g/m². Low sheer. Collar and shoulder keep their shape.","A white to wear on its own."]'::jsonb,
    '/fabric/28g-jersey.jpg', '28-gauge white cotton jersey, close-up', 1,
    5, 2, 5, 1, 3
  ),
  (
    '36g-jersey', '36G Jersey', 'The standard white.',
    '["Compact yarn at 36 gauge. Smooth, even surface.","160 g/m². Neither heavy nor thin.","The one to start with."]'::jsonb,
    '/fabric/36g-jersey.jpg', '36-gauge white cotton jersey, close-up', 2,
    3, 3, 3, 2, 4
  ),
  (
    '46g-jersey', '46G Jersey', 'Thin. Dense. Smooth.',
    '["46 needles to the inch — rare for a cut-and-sewn tee.","130 g/m². Falls like a woven, with a quiet lustre.","Sits clean under a jacket."]'::jsonb,
    '/fabric/46g-jersey.jpg', '46-gauge white cotton jersey, close-up', 3,
    2, 4, 2, 3, 5
  )
on conflict (slug) do update set
  name = excluded.name,
  tagline = excluded.tagline,
  description_lines = excluded.description_lines,
  image_url = excluded.image_url,
  image_alt = excluded.image_alt,
  sort_order = excluded.sort_order,
  character_thickness = excluded.character_thickness,
  character_softness = excluded.character_softness,
  character_structure = excluded.character_structure,
  character_sheerness = excluded.character_sheerness,
  character_surface = excluded.character_surface,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- 2. Products — 28G / 36G / 46G × Regular / Box
-- ---------------------------------------------------------------------------
-- created_at is staggered so the storefront (ordered by created_at) lists
-- them in catalog order. It is not touched on conflict.
insert into public.products (
  id, slug, name, description, detail_description, fit_note,
  material, care, size_guide, is_published, price, fabric_slug,
  sleeve_type, fit_type, fit_profile, created_at
)
values
  (
    '20000000-0000-4000-8000-000000000001',
    '28g-regular-tee',
    '28G Regular Tee',
    '双糸で編んだ肉厚の度詰天竺。一枚で着る、ハリのある白。',
    '40/2コーマ糸を28ゲージで詰めて編んだ度詰天竺。目付240g/m²。厚みとハリがあり、透けにくい生地です。身幅54cm・着丈70cm（Mサイズ）の標準的なシルエットです。',
    'Regular fit',
    'COTTON 100%',
    'MACHINE WASH COLD WITH LIKE COLORS. DO NOT BLEACH. TUMBLE DRY LOW. COOL IRON IF NEEDED.',
    '[{"size":"S","length":68,"shoulder":44,"chest":52,"sleeve":20},{"size":"M","length":70,"shoulder":46,"chest":54,"sleeve":21},{"size":"L","length":72,"shoulder":48,"chest":56,"sleeve":22}]'::jsonb,
    true, 16000, '28g-jersey', 'short', 'regular',
    '{"fitType":"regular","fitLabel":"Regular fit","models":[{"heightCm":178,"weightKg":68,"size":"L"}],"sizeReference":[{"size":"S","heightMin":155,"heightMax":168,"heightLabel":"155–168cm"},{"size":"M","heightMin":165,"heightMax":175,"heightLabel":"165–175cm"},{"size":"L","heightMin":175,"heightMax":200,"heightLabel":"175cm+"}],"fitTypeSizeOffset":0,"preferenceAdjustments":{"justFit":0,"relaxed":1,"oversized":2}}'::jsonb,
    now() + interval '0 seconds'
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    '28g-box-tee',
    '28G Box Tee',
    '肉厚の28Gを、広い身幅と短い着丈で。形が立つ白。',
    '40/2コーマ糸を28ゲージで詰めて編んだ度詰天竺。目付240g/m²。生地のハリで、形が立ちます。身幅60cm・着丈67cm（Mサイズ）。Regularより身幅が6cm広く、着丈が3cm短い箱形です。',
    'Box fit',
    'COTTON 100%',
    'MACHINE WASH COLD WITH LIKE COLORS. DO NOT BLEACH. TUMBLE DRY LOW. COOL IRON IF NEEDED.',
    '[{"size":"S","length":65,"shoulder":52,"chest":58,"sleeve":23},{"size":"M","length":67,"shoulder":54,"chest":60,"sleeve":24},{"size":"L","length":69,"shoulder":56,"chest":62,"sleeve":25}]'::jsonb,
    true, 16000, '28g-jersey', 'short', 'boxy',
    '{"fitType":"boxy","fitLabel":"Box fit","models":[{"heightCm":178,"weightKg":68,"size":"L"}],"sizeReference":[{"size":"S","heightMin":155,"heightMax":168,"heightLabel":"155–168cm"},{"size":"M","heightMin":165,"heightMax":175,"heightLabel":"165–175cm"},{"size":"L","heightMin":175,"heightMax":200,"heightLabel":"175cm+"}],"fitTypeSizeOffset":0,"preferenceAdjustments":{"justFit":0,"relaxed":1,"oversized":2}}'::jsonb,
    now() + interval '1 seconds'
  ),
  (
    '20000000-0000-4000-8000-000000000003',
    '36g-regular-tee',
    '36G Regular Tee',
    '滑らかで偏りのない36G。毎日着るための基準の白。',
    '60/1コンパクト糸を36ゲージで編んだ度詰天竺。目付160g/m²。毛羽が少なく、表面は滑らかで均一です。身幅54cm・着丈70cm（Mサイズ）の標準的なシルエットです。',
    'Regular fit',
    'COTTON 100%',
    'MACHINE WASH COLD WITH LIKE COLORS. DO NOT BLEACH. TUMBLE DRY LOW. COOL IRON IF NEEDED.',
    '[{"size":"S","length":68,"shoulder":44,"chest":52,"sleeve":20},{"size":"M","length":70,"shoulder":46,"chest":54,"sleeve":21},{"size":"L","length":72,"shoulder":48,"chest":56,"sleeve":22}]'::jsonb,
    true, 15000, '36g-jersey', 'short', 'regular',
    '{"fitType":"regular","fitLabel":"Regular fit","models":[{"heightCm":178,"weightKg":68,"size":"L"}],"sizeReference":[{"size":"S","heightMin":155,"heightMax":168,"heightLabel":"155–168cm"},{"size":"M","heightMin":165,"heightMax":175,"heightLabel":"165–175cm"},{"size":"L","heightMin":175,"heightMax":200,"heightLabel":"175cm+"}],"fitTypeSizeOffset":0,"preferenceAdjustments":{"justFit":0,"relaxed":1,"oversized":2}}'::jsonb,
    now() + interval '2 seconds'
  ),
  (
    '20000000-0000-4000-8000-000000000004',
    '36g-box-tee',
    '36G Box Tee',
    '36Gの落ち着いた表面を、ゆとりのある箱形で。',
    '60/1コンパクト糸を36ゲージで編んだ度詰天竺。目付160g/m²。落ち着いた表面を、ゆとりのある形で。身幅60cm・着丈67cm（Mサイズ）。Regularより身幅が6cm広く、着丈が3cm短い箱形です。',
    'Box fit',
    'COTTON 100%',
    'MACHINE WASH COLD WITH LIKE COLORS. DO NOT BLEACH. TUMBLE DRY LOW. COOL IRON IF NEEDED.',
    '[{"size":"S","length":65,"shoulder":52,"chest":58,"sleeve":23},{"size":"M","length":67,"shoulder":54,"chest":60,"sleeve":24},{"size":"L","length":69,"shoulder":56,"chest":62,"sleeve":25}]'::jsonb,
    true, 15000, '36g-jersey', 'short', 'boxy',
    '{"fitType":"boxy","fitLabel":"Box fit","models":[{"heightCm":178,"weightKg":68,"size":"L"}],"sizeReference":[{"size":"S","heightMin":155,"heightMax":168,"heightLabel":"155–168cm"},{"size":"M","heightMin":165,"heightMax":175,"heightLabel":"165–175cm"},{"size":"L","heightMin":175,"heightMax":200,"heightLabel":"175cm+"}],"fitTypeSizeOffset":0,"preferenceAdjustments":{"justFit":0,"relaxed":1,"oversized":2}}'::jsonb,
    now() + interval '3 seconds'
  ),
  (
    '20000000-0000-4000-8000-000000000005',
    '46g-regular-tee',
    '46G Regular Tee',
    '1インチに針46本。薄く、密で、ジャケットの下に収まる白。',
    '80/1コーマコンパクト糸を46ゲージで編んだ度詰天竺。目付130g/m²。1インチに針46本。薄手でも目が詰まり、布帛のような落ち感と控えめな光沢が出ます。身幅54cm・着丈70cm（Mサイズ）の標準的なシルエットです。',
    'Regular fit',
    'COTTON 100%',
    'MACHINE WASH COLD WITH LIKE COLORS. DO NOT BLEACH. TUMBLE DRY LOW. COOL IRON IF NEEDED.',
    '[{"size":"S","length":68,"shoulder":44,"chest":52,"sleeve":20},{"size":"M","length":70,"shoulder":46,"chest":54,"sleeve":21},{"size":"L","length":72,"shoulder":48,"chest":56,"sleeve":22}]'::jsonb,
    true, 18000, '46g-jersey', 'short', 'regular',
    '{"fitType":"regular","fitLabel":"Regular fit","models":[{"heightCm":178,"weightKg":68,"size":"L"}],"sizeReference":[{"size":"S","heightMin":155,"heightMax":168,"heightLabel":"155–168cm"},{"size":"M","heightMin":165,"heightMax":175,"heightLabel":"165–175cm"},{"size":"L","heightMin":175,"heightMax":200,"heightLabel":"175cm+"}],"fitTypeSizeOffset":0,"preferenceAdjustments":{"justFit":0,"relaxed":1,"oversized":2}}'::jsonb,
    now() + interval '4 seconds'
  ),
  (
    '20000000-0000-4000-8000-000000000006',
    '46g-box-tee',
    '46G Box Tee',
    '最も細かい46Gを、広い身幅で。布帛のように落ちる白。',
    '80/1コーマコンパクト糸を46ゲージで編んだ度詰天竺。目付130g/m²。1インチに針46本。薄く密な生地が、広い身幅からまっすぐ落ちます。身幅60cm・着丈67cm（Mサイズ）。Regularより身幅が6cm広く、着丈が3cm短い箱形です。',
    'Box fit',
    'COTTON 100%',
    'MACHINE WASH COLD WITH LIKE COLORS. DO NOT BLEACH. TUMBLE DRY LOW. COOL IRON IF NEEDED.',
    '[{"size":"S","length":65,"shoulder":52,"chest":58,"sleeve":23},{"size":"M","length":67,"shoulder":54,"chest":60,"sleeve":24},{"size":"L","length":69,"shoulder":56,"chest":62,"sleeve":25}]'::jsonb,
    true, 18000, '46g-jersey', 'short', 'boxy',
    '{"fitType":"boxy","fitLabel":"Box fit","models":[{"heightCm":178,"weightKg":68,"size":"L"}],"sizeReference":[{"size":"S","heightMin":155,"heightMax":168,"heightLabel":"155–168cm"},{"size":"M","heightMin":165,"heightMax":175,"heightLabel":"165–175cm"},{"size":"L","heightMin":175,"heightMax":200,"heightLabel":"175cm+"}],"fitTypeSizeOffset":0,"preferenceAdjustments":{"justFit":0,"relaxed":1,"oversized":2}}'::jsonb,
    now() + interval '5 seconds'
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
  fit_profile = excluded.fit_profile,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- 3. Images — 01 front · 02 back · 03 on-model (card hover) · 04 collar
-- ---------------------------------------------------------------------------
-- product_id is looked up by slug in case a row with the same slug already
-- existed under a different id.
-- Clear flags on any other image rows first: the partial unique indexes allow
-- one primary and one card-hover image per product.
update public.product_images
set is_primary = false, is_card_hover = false
where product_id in (
  select id from public.products where slug in (
    '28g-regular-tee',
    '28g-box-tee',
    '36g-regular-tee',
    '36g-box-tee',
    '46g-regular-tee',
    '46g-box-tee'
  )
)
  and id not in (
    '21000000-0000-4000-8000-000000000011',
    '21000000-0000-4000-8000-000000000012',
    '21000000-0000-4000-8000-000000000013',
    '21000000-0000-4000-8000-000000000014',
    '21000000-0000-4000-8000-000000000021',
    '21000000-0000-4000-8000-000000000022',
    '21000000-0000-4000-8000-000000000023',
    '21000000-0000-4000-8000-000000000024',
    '21000000-0000-4000-8000-000000000031',
    '21000000-0000-4000-8000-000000000032',
    '21000000-0000-4000-8000-000000000033',
    '21000000-0000-4000-8000-000000000034',
    '21000000-0000-4000-8000-000000000041',
    '21000000-0000-4000-8000-000000000042',
    '21000000-0000-4000-8000-000000000043',
    '21000000-0000-4000-8000-000000000044',
    '21000000-0000-4000-8000-000000000051',
    '21000000-0000-4000-8000-000000000052',
    '21000000-0000-4000-8000-000000000053',
    '21000000-0000-4000-8000-000000000054',
    '21000000-0000-4000-8000-000000000061',
    '21000000-0000-4000-8000-000000000062',
    '21000000-0000-4000-8000-000000000063',
    '21000000-0000-4000-8000-000000000064'
  )
  and (is_primary or is_card_hover);

insert into public.product_images (id, product_id, url, sort_order, is_primary, is_card_hover)
values
  ('21000000-0000-4000-8000-000000000011', (select id from public.products where slug = '28g-regular-tee'), '/products/28g-regular-tee-01.jpg', 0, true, false),
  ('21000000-0000-4000-8000-000000000012', (select id from public.products where slug = '28g-regular-tee'), '/products/28g-regular-tee-02.jpg', 1, false, false),
  ('21000000-0000-4000-8000-000000000013', (select id from public.products where slug = '28g-regular-tee'), '/products/28g-regular-tee-03.jpg', 2, false, true),
  ('21000000-0000-4000-8000-000000000014', (select id from public.products where slug = '28g-regular-tee'), '/products/28g-regular-tee-04.jpg', 3, false, false),

  ('21000000-0000-4000-8000-000000000021', (select id from public.products where slug = '28g-box-tee'), '/products/28g-box-tee-01.jpg', 0, true, false),
  ('21000000-0000-4000-8000-000000000022', (select id from public.products where slug = '28g-box-tee'), '/products/28g-box-tee-02.jpg', 1, false, false),
  ('21000000-0000-4000-8000-000000000023', (select id from public.products where slug = '28g-box-tee'), '/products/28g-box-tee-03.jpg', 2, false, true),
  ('21000000-0000-4000-8000-000000000024', (select id from public.products where slug = '28g-box-tee'), '/products/28g-box-tee-04.jpg', 3, false, false),

  ('21000000-0000-4000-8000-000000000031', (select id from public.products where slug = '36g-regular-tee'), '/products/36g-regular-tee-01.jpg', 0, true, false),
  ('21000000-0000-4000-8000-000000000032', (select id from public.products where slug = '36g-regular-tee'), '/products/36g-regular-tee-02.jpg', 1, false, false),
  ('21000000-0000-4000-8000-000000000033', (select id from public.products where slug = '36g-regular-tee'), '/products/36g-regular-tee-03.jpg', 2, false, true),
  ('21000000-0000-4000-8000-000000000034', (select id from public.products where slug = '36g-regular-tee'), '/products/36g-regular-tee-04.jpg', 3, false, false),

  ('21000000-0000-4000-8000-000000000041', (select id from public.products where slug = '36g-box-tee'), '/products/36g-box-tee-01.jpg', 0, true, false),
  ('21000000-0000-4000-8000-000000000042', (select id from public.products where slug = '36g-box-tee'), '/products/36g-box-tee-02.jpg', 1, false, false),
  ('21000000-0000-4000-8000-000000000043', (select id from public.products where slug = '36g-box-tee'), '/products/36g-box-tee-03.jpg', 2, false, true),
  ('21000000-0000-4000-8000-000000000044', (select id from public.products where slug = '36g-box-tee'), '/products/36g-box-tee-04.jpg', 3, false, false),

  ('21000000-0000-4000-8000-000000000051', (select id from public.products where slug = '46g-regular-tee'), '/products/46g-regular-tee-01.jpg', 0, true, false),
  ('21000000-0000-4000-8000-000000000052', (select id from public.products where slug = '46g-regular-tee'), '/products/46g-regular-tee-02.jpg', 1, false, false),
  ('21000000-0000-4000-8000-000000000053', (select id from public.products where slug = '46g-regular-tee'), '/products/46g-regular-tee-03.jpg', 2, false, true),
  ('21000000-0000-4000-8000-000000000054', (select id from public.products where slug = '46g-regular-tee'), '/products/46g-regular-tee-04.jpg', 3, false, false),

  ('21000000-0000-4000-8000-000000000061', (select id from public.products where slug = '46g-box-tee'), '/products/46g-box-tee-01.jpg', 0, true, false),
  ('21000000-0000-4000-8000-000000000062', (select id from public.products where slug = '46g-box-tee'), '/products/46g-box-tee-02.jpg', 1, false, false),
  ('21000000-0000-4000-8000-000000000063', (select id from public.products where slug = '46g-box-tee'), '/products/46g-box-tee-03.jpg', 2, false, true),
  ('21000000-0000-4000-8000-000000000064', (select id from public.products where slug = '46g-box-tee'), '/products/46g-box-tee-04.jpg', 3, false, false)
on conflict (id) do update set
  product_id = excluded.product_id,
  url = excluded.url,
  sort_order = excluded.sort_order,
  is_primary = excluded.is_primary,
  is_card_hover = excluded.is_card_hover;

-- ---------------------------------------------------------------------------
-- 4. Variants — S / M / L, stock 10 on first insert
-- ---------------------------------------------------------------------------
insert into public.product_variants (id, product_id, size, sku, stock_quantity)
values
  ('31000000-0000-4000-8000-000000000011', (select id from public.products where slug = '28g-regular-tee'), 'S', 'WT-28R-S', 10),
  ('31000000-0000-4000-8000-000000000012', (select id from public.products where slug = '28g-regular-tee'), 'M', 'WT-28R-M', 10),
  ('31000000-0000-4000-8000-000000000013', (select id from public.products where slug = '28g-regular-tee'), 'L', 'WT-28R-L', 10),

  ('31000000-0000-4000-8000-000000000021', (select id from public.products where slug = '28g-box-tee'), 'S', 'WT-28B-S', 10),
  ('31000000-0000-4000-8000-000000000022', (select id from public.products where slug = '28g-box-tee'), 'M', 'WT-28B-M', 10),
  ('31000000-0000-4000-8000-000000000023', (select id from public.products where slug = '28g-box-tee'), 'L', 'WT-28B-L', 10),

  ('31000000-0000-4000-8000-000000000031', (select id from public.products where slug = '36g-regular-tee'), 'S', 'WT-36R-S', 10),
  ('31000000-0000-4000-8000-000000000032', (select id from public.products where slug = '36g-regular-tee'), 'M', 'WT-36R-M', 10),
  ('31000000-0000-4000-8000-000000000033', (select id from public.products where slug = '36g-regular-tee'), 'L', 'WT-36R-L', 10),

  ('31000000-0000-4000-8000-000000000041', (select id from public.products where slug = '36g-box-tee'), 'S', 'WT-36B-S', 10),
  ('31000000-0000-4000-8000-000000000042', (select id from public.products where slug = '36g-box-tee'), 'M', 'WT-36B-M', 10),
  ('31000000-0000-4000-8000-000000000043', (select id from public.products where slug = '36g-box-tee'), 'L', 'WT-36B-L', 10),

  ('31000000-0000-4000-8000-000000000051', (select id from public.products where slug = '46g-regular-tee'), 'S', 'WT-46R-S', 10),
  ('31000000-0000-4000-8000-000000000052', (select id from public.products where slug = '46g-regular-tee'), 'M', 'WT-46R-M', 10),
  ('31000000-0000-4000-8000-000000000053', (select id from public.products where slug = '46g-regular-tee'), 'L', 'WT-46R-L', 10),

  ('31000000-0000-4000-8000-000000000061', (select id from public.products where slug = '46g-box-tee'), 'S', 'WT-46B-S', 10),
  ('31000000-0000-4000-8000-000000000062', (select id from public.products where slug = '46g-box-tee'), 'M', 'WT-46B-M', 10),
  ('31000000-0000-4000-8000-000000000063', (select id from public.products where slug = '46g-box-tee'), 'L', 'WT-46B-L', 10)
on conflict (product_id, size) do update set
  sku = excluded.sku;

-- ---------------------------------------------------------------------------
-- 5. Retire the previous lineup
-- ---------------------------------------------------------------------------
-- Unpublish, never delete: order_items.product_id references products
-- (on delete restrict), and past orders must keep resolving.
update public.products
set is_published = false, updated_at = now()
where is_published = true
  and slug in (
    'heavyweight-crew-neck',
    'lightweight-pocket-tee',
    'relaxed-fit-tee',
    'compact-cotton-tee',
    'box-fit-tee',
    'long-sleeve-essential',
    'short-sleeve-essential',
    'heavyweight-crew-neck-long-sleeve',
    'lightweight-pocket-tee-long-sleeve',
    'relaxed-fit-tee-long-sleeve',
    'compact-cotton-tee-long-sleeve',
    'box-fit-tee-long-sleeve'
  );

-- Old fabrics: products.fabric_slug references fabrics (on delete restrict),
-- so a fabric still used by any product row (published or not) has to stay.
-- Delete only the unreferenced ones and move the rest behind the gauges.
-- The storefront lists a fabric only when it has a published product.
delete from public.fabrics f
where f.slug in (
    'heavyweight-jersey',
    'lightweight-jersey',
    'relaxed-jersey',
    'compact-jersey',
    'essential-jersey',
    'box-jersey'
  )
  and not exists (
    select 1 from public.products p where p.fabric_slug = f.slug
  );

update public.fabrics
set sort_order = sort_order + 100, updated_at = now()
where sort_order < 100
  and slug in (
    'heavyweight-jersey',
    'lightweight-jersey',
    'relaxed-jersey',
    'compact-jersey',
    'essential-jersey',
    'box-jersey'
  );

-- ---------------------------------------------------------------------------
-- 6. Home content — drop retired slugs from the featured list
-- ---------------------------------------------------------------------------
-- Guarded so the file also runs on a database without the CMS table.
do $$
begin
  if to_regclass('public.site_content') is null then
    return;
  end if;

  update public.site_content sc
  set content = jsonb_set(
    sc.content,
    '{featuredProductSlugs}',
    coalesce(
      (
        select jsonb_agg(to_jsonb(t.slug) order by t.ord)
        from jsonb_array_elements_text(sc.content -> 'featuredProductSlugs')
          with ordinality as t(slug, ord)
        where t.slug not in (
          'heavyweight-crew-neck',
          'lightweight-pocket-tee',
          'relaxed-fit-tee',
          'compact-cotton-tee',
          'box-fit-tee',
          'long-sleeve-essential',
          'short-sleeve-essential',
          'heavyweight-crew-neck-long-sleeve',
          'lightweight-pocket-tee-long-sleeve',
          'relaxed-fit-tee-long-sleeve',
          'compact-cotton-tee-long-sleeve',
          'box-fit-tee-long-sleeve'
        )
      ),
      '[]'::jsonb
    )
  )
  where sc.key = 'home'
    and jsonb_typeof(sc.content -> 'featuredProductSlugs') = 'array'
    and sc.content -> 'featuredProductSlugs' ?| array[
      'heavyweight-crew-neck',
      'lightweight-pocket-tee',
      'relaxed-fit-tee',
      'compact-cotton-tee',
      'box-fit-tee',
      'long-sleeve-essential',
      'short-sleeve-essential',
      'heavyweight-crew-neck-long-sleeve',
      'lightweight-pocket-tee-long-sleeve',
      'relaxed-fit-tee-long-sleeve',
      'compact-cotton-tee-long-sleeve',
      'box-fit-tee-long-sleeve'
    ];
end
$$;
