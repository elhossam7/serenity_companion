-- Add consent fields to user_profiles
alter table if exists public.user_profiles
add column if not exists has_consented boolean default false;

alter table if exists public.user_profiles
add column if not exists consent_accepted_at timestamp with time zone;

-- Optional: simple RLS policy allowing users to update their own consent fields
-- Adjust if you already manage RLS separately.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_profiles' AND policyname = 'update_own_consent'
  ) THEN
    CREATE POLICY update_own_consent ON public.user_profiles
      FOR UPDATE TO authenticated
      USING ( auth.uid() = id )
      WITH CHECK ( auth.uid() = id );
  END IF;
END$$;
