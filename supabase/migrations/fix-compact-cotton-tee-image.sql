-- Fix broken Unsplash URL for Compact Cotton Tee (404)
update public.product_images
set url = '/products/compact-cotton-tee.jpg'
where id = '20000000-0000-4000-8000-000000000004';
