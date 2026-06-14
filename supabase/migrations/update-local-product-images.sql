-- Point product images to local SVG placeholders in /public
update public.product_images set url = '/products/heavyweight-crew-neck.svg'
where product_id = '10000000-0000-4000-8000-000000000001' and is_primary = true;

update public.product_images set url = '/products/lightweight-pocket-tee.svg'
where product_id = '10000000-0000-4000-8000-000000000002' and is_primary = true;

update public.product_images set url = '/products/relaxed-fit-tee.svg'
where product_id = '10000000-0000-4000-8000-000000000003' and is_primary = true;

update public.product_images set url = '/products/compact-cotton-tee.svg'
where product_id = '10000000-0000-4000-8000-000000000004' and is_primary = true;

update public.product_images set url = '/products/long-sleeve-essential.svg'
where product_id = '10000000-0000-4000-8000-000000000005' and is_primary = true;

update public.product_images set url = '/products/box-fit-tee.svg'
where product_id = '10000000-0000-4000-8000-000000000006' and is_primary = true;
