-- Update Process entry copy on Stories page (Wakayama / slow development tone)
update public.site_content
set
  content = jsonb_set(
    content,
    '{entries}',
    (
      select jsonb_agg(
        case
          when entry->>'id' = 'process' then
            jsonb_build_object(
              'id', 'process',
              'title', 'Process',
              'lines', jsonb_build_array(
                'Knitted in Wakayama.',
                'Developed slowly, one fabric at a time.'
              ),
              'imageUrl', '/stories/process.jpg',
              'imageAlt', 'White yarn and knitting in soft light'
            )
          else entry
        end
        order by ordinality
      )
      from jsonb_array_elements(content->'entries') with ordinality as t(entry, ordinality)
    )
  ),
  updated_at = now()
where key = 'stories';
