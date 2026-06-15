-- Fabric character traits (1–5 sensory scale)
alter table public.fabrics
  add column if not exists character_thickness smallint not null default 3
    check (character_thickness between 1 and 5),
  add column if not exists character_softness smallint not null default 3
    check (character_softness between 1 and 5),
  add column if not exists character_structure smallint not null default 3
    check (character_structure between 1 and 5),
  add column if not exists character_sheerness smallint not null default 2
    check (character_sheerness between 1 and 5),
  add column if not exists character_surface smallint not null default 3
    check (character_surface between 1 and 5);

update public.fabrics set
  character_thickness = 5, character_softness = 2, character_structure = 5,
  character_sheerness = 1, character_surface = 4
where slug = 'heavyweight-jersey';

update public.fabrics set
  character_thickness = 2, character_softness = 5, character_structure = 2,
  character_sheerness = 4, character_surface = 3
where slug = 'lightweight-jersey';

update public.fabrics set
  character_thickness = 3, character_softness = 4, character_structure = 3,
  character_sheerness = 3, character_surface = 3
where slug = 'relaxed-jersey';

update public.fabrics set
  character_thickness = 3, character_softness = 3, character_structure = 4,
  character_sheerness = 2, character_surface = 4
where slug = 'compact-jersey';

update public.fabrics set
  character_thickness = 3, character_softness = 3, character_structure = 3,
  character_sheerness = 2, character_surface = 3
where slug = 'essential-jersey';

update public.fabrics set
  character_thickness = 4, character_softness = 2, character_structure = 5,
  character_sheerness = 1, character_surface = 5
where slug = 'box-jersey';
