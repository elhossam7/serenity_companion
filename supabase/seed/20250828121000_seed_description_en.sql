-- Seed English descriptions if missing using French or generic description
update wellness_resources
  set description_en = coalesce(description_en, description_fr, description)
where description_en is null;
