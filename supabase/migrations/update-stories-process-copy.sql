-- Update Process copy on Stories page
update public.site_content
set
  content = jsonb_set(
    content,
    '{entries}',
    (
      select jsonb_agg(
        case
          when entry->>'id' = 'process' then
            jsonb_set(
              entry,
              '{lines}',
              jsonb_build_array(
                'Knitted in Wakayama.',
                'On our own machines, at our own pace.'
              )
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
