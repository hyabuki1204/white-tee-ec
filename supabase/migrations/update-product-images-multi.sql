-- Migrate product images from SVG placeholders to multi-image JPG set

-- Update existing primary images to front flat-lay JPG
update public.product_images pi
set url = '/products/' || p.slug || '-01.jpg'
from public.products p
where pi.product_id = p.id
  and pi.is_primary = true;

-- Insert fabric macro (-02) and back view (-03) for each product
insert into public.product_images (id, product_id, url, sort_order, is_primary)
values
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
