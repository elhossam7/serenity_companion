-- Add English description to wellness_resources if not exists
alter table if exists wellness_resources
  add column if not exists description_en text;

-- Optional: backfill with existing description_fr or description if en is null
update wellness_resources
  set description_en = coalesce(description_en, description_fr, description)
where description_en is null;
