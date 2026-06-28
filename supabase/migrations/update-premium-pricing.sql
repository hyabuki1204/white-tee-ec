-- Premium price ladder: ¥12,000–¥18,000 (core at ¥15,000)

update public.products set price = 12000, updated_at = now() where slug = 'compact-cotton-tee';
update public.products set price = 13000, updated_at = now() where slug = 'lightweight-pocket-tee';
update public.products set price = 13500, updated_at = now() where slug = 'compact-cotton-tee-long-sleeve';
update public.products set price = 14000, updated_at = now() where slug = 'relaxed-fit-tee';
update public.products set price = 14500, updated_at = now() where slug = 'lightweight-pocket-tee-long-sleeve';
update public.products set price = 14500, updated_at = now() where slug = 'short-sleeve-essential';
update public.products set price = 15000, updated_at = now() where slug = 'heavyweight-crew-neck';
update public.products set price = 15000, updated_at = now() where slug = 'box-fit-tee';
update public.products set price = 15500, updated_at = now() where slug = 'relaxed-fit-tee-long-sleeve';
update public.products set price = 16500, updated_at = now() where slug = 'long-sleeve-essential';
update public.products set price = 17000, updated_at = now() where slug = 'heavyweight-crew-neck-long-sleeve';
update public.products set price = 18000, updated_at = now() where slug = 'box-fit-tee-long-sleeve';
