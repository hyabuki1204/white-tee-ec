-- Update model wear gallery images from SVG placeholders to JPG

update public.product_images
set url = regexp_replace(url, '-04\.svg$', '-04.jpg')
where url like '%-04.svg';

update public.product_images
set url = regexp_replace(url, '-05\.svg$', '-05.jpg')
where url like '%-05.svg';
