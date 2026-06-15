-- Product fit profiles (model info, size reference) and model wear gallery images

alter table public.products
  add column if not exists fit_profile jsonb;

update public.products
set fit_profile = '{
  "fitType": "regular",
  "fitLabel": "Regular fit",
  "models": [{"heightCm": 178, "weightKg": 68, "size": "L"}],
  "sizeReference": [
    {"size": "S", "heightMin": 155, "heightMax": 168, "heightLabel": "155–168cm"},
    {"size": "M", "heightMin": 165, "heightMax": 175, "heightLabel": "165–175cm"},
    {"size": "L", "heightMin": 175, "heightMax": 185, "heightLabel": "175–185cm"},
    {"size": "XL", "heightMin": 180, "heightMax": 200, "heightLabel": "180cm+"}
  ],
  "fitTypeSizeOffset": 0,
  "preferenceAdjustments": {"justFit": 0, "relaxed": 1, "oversized": 2}
}'::jsonb
where slug = 'heavyweight-crew-neck';

update public.products
set fit_profile = '{
  "fitType": "regular",
  "fitLabel": "Regular fit",
  "models": [{"heightCm": 175, "weightKg": 62, "size": "M"}],
  "sizeReference": [
    {"size": "S", "heightMin": 155, "heightMax": 168, "heightLabel": "155–168cm"},
    {"size": "M", "heightMin": 165, "heightMax": 175, "heightLabel": "165–175cm"},
    {"size": "L", "heightMin": 175, "heightMax": 185, "heightLabel": "175–185cm"},
    {"size": "XL", "heightMin": 180, "heightMax": 200, "heightLabel": "180cm+"}
  ],
  "fitTypeSizeOffset": 0,
  "preferenceAdjustments": {"justFit": 0, "relaxed": 1, "oversized": 2}
}'::jsonb
where slug = 'lightweight-pocket-tee';

update public.products
set fit_profile = '{
  "fitType": "relaxed",
  "fitLabel": "Relaxed silhouette",
  "models": [{"heightCm": 175, "weightKg": 65, "size": "L"}],
  "sizeReference": [
    {"size": "S", "heightMin": 155, "heightMax": 170, "heightLabel": "155–170cm"},
    {"size": "M", "heightMin": 165, "heightMax": 178, "heightLabel": "165–178cm"},
    {"size": "L", "heightMin": 172, "heightMax": 188, "heightLabel": "172–188cm"},
    {"size": "XL", "heightMin": 180, "heightMax": 200, "heightLabel": "180cm+"}
  ],
  "fitTypeSizeOffset": 1,
  "preferenceAdjustments": {"justFit": 0, "relaxed": 1, "oversized": 2}
}'::jsonb
where slug = 'relaxed-fit-tee';

update public.products
set fit_profile = '{
  "fitType": "slim",
  "fitLabel": "Slim fit",
  "models": [{"heightCm": 170, "weightKg": 58, "size": "M"}],
  "sizeReference": [
    {"size": "S", "heightMin": 150, "heightMax": 165, "heightLabel": "150–165cm"},
    {"size": "M", "heightMin": 160, "heightMax": 172, "heightLabel": "160–172cm"},
    {"size": "L", "heightMin": 168, "heightMax": 180, "heightLabel": "168–180cm"},
    {"size": "XL", "heightMin": 175, "heightMax": 195, "heightLabel": "175cm+"}
  ],
  "fitTypeSizeOffset": -1,
  "preferenceAdjustments": {"justFit": 0, "relaxed": 1, "oversized": 2}
}'::jsonb
where slug = 'compact-cotton-tee';

update public.products
set fit_profile = '{
  "fitType": "regular",
  "fitLabel": "Regular fit",
  "models": [{"heightCm": 178, "weightKg": 66, "size": "L"}],
  "sizeReference": [
    {"size": "S", "heightMin": 155, "heightMax": 168, "heightLabel": "155–168cm"},
    {"size": "M", "heightMin": 165, "heightMax": 175, "heightLabel": "165–175cm"},
    {"size": "L", "heightMin": 175, "heightMax": 185, "heightLabel": "175–185cm"},
    {"size": "XL", "heightMin": 180, "heightMax": 200, "heightLabel": "180cm+"}
  ],
  "fitTypeSizeOffset": 0,
  "preferenceAdjustments": {"justFit": 0, "relaxed": 1, "oversized": 2}
}'::jsonb
where slug = 'long-sleeve-essential';

update public.products
set fit_profile = '{
  "fitType": "boxy",
  "fitLabel": "Boxy shape",
  "models": [{"heightCm": 180, "weightKg": 72, "size": "L"}],
  "sizeReference": [
    {"size": "S", "heightMin": 160, "heightMax": 172, "heightLabel": "160–172cm"},
    {"size": "M", "heightMin": 168, "heightMax": 180, "heightLabel": "168–180cm"},
    {"size": "L", "heightMin": 175, "heightMax": 188, "heightLabel": "175–188cm"},
    {"size": "XL", "heightMin": 182, "heightMax": 200, "heightLabel": "182cm+"}
  ],
  "fitTypeSizeOffset": 1,
  "preferenceAdjustments": {"justFit": 0, "relaxed": 1, "oversized": 2}
}'::jsonb
where slug = 'box-fit-tee';

insert into public.product_images (id, product_id, url, sort_order, is_primary)
values
  (
    '20000000-0000-4000-8000-000000010041',
    '10000000-0000-4000-8000-000000000001',
    '/products/heavyweight-crew-neck-04.svg',
    3,
    false
  ),
  (
    '20000000-0000-4000-8000-000000010051',
    '10000000-0000-4000-8000-000000000001',
    '/products/heavyweight-crew-neck-05.svg',
    4,
    false
  ),
  (
    '20000000-0000-4000-8000-000000020041',
    '10000000-0000-4000-8000-000000000002',
    '/products/lightweight-pocket-tee-04.svg',
    3,
    false
  ),
  (
    '20000000-0000-4000-8000-000000020051',
    '10000000-0000-4000-8000-000000000002',
    '/products/lightweight-pocket-tee-05.svg',
    4,
    false
  ),
  (
    '20000000-0000-4000-8000-000000030041',
    '10000000-0000-4000-8000-000000000003',
    '/products/relaxed-fit-tee-04.svg',
    3,
    false
  ),
  (
    '20000000-0000-4000-8000-000000030051',
    '10000000-0000-4000-8000-000000000003',
    '/products/relaxed-fit-tee-05.svg',
    4,
    false
  ),
  (
    '20000000-0000-4000-8000-000000040041',
    '10000000-0000-4000-8000-000000000004',
    '/products/compact-cotton-tee-04.svg',
    3,
    false
  ),
  (
    '20000000-0000-4000-8000-000000040051',
    '10000000-0000-4000-8000-000000000004',
    '/products/compact-cotton-tee-05.svg',
    4,
    false
  ),
  (
    '20000000-0000-4000-8000-000000050041',
    '10000000-0000-4000-8000-000000000005',
    '/products/long-sleeve-essential-04.svg',
    3,
    false
  ),
  (
    '20000000-0000-4000-8000-000000050051',
    '10000000-0000-4000-8000-000000000005',
    '/products/long-sleeve-essential-05.svg',
    4,
    false
  ),
  (
    '20000000-0000-4000-8000-000000060041',
    '10000000-0000-4000-8000-000000000006',
    '/products/box-fit-tee-04.svg',
    3,
    false
  ),
  (
    '20000000-0000-4000-8000-000000060051',
    '10000000-0000-4000-8000-000000000006',
    '/products/box-fit-tee-05.svg',
    4,
    false
  )
on conflict (id) do update set
  url = excluded.url,
  sort_order = excluded.sort_order,
  is_primary = excluded.is_primary;
