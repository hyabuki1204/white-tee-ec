-- Point fabric images to local JPG placeholders in /public/fabric
update public.fabrics set image_url = '/fabric/heavyweight-jersey.jpg'
where slug = 'heavyweight-jersey';

update public.fabrics set image_url = '/fabric/lightweight-jersey.jpg'
where slug = 'lightweight-jersey';

update public.fabrics set image_url = '/fabric/relaxed-jersey.jpg'
where slug = 'relaxed-jersey';

update public.fabrics set image_url = '/fabric/compact-jersey.jpg'
where slug = 'compact-jersey';

update public.fabrics set image_url = '/fabric/essential-jersey.jpg'
where slug = 'essential-jersey';

update public.fabrics set image_url = '/fabric/box-jersey.jpg'
where slug = 'box-jersey';
