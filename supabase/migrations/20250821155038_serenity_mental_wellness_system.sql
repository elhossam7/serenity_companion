-- Location: supabase/migrations/20250821155038_serenity_mental_wellness_system.sql
-- Schema Analysis: Fresh project - creating complete mental wellness system
-- Integration Type: Complete new schema for mental health and wellbeing platform
-- Dependencies: None - fresh database

-- 1. Custom Types
CREATE TYPE public.mood_level AS ENUM ('very_low', 'low', 'neutral', 'good', 'excellent');
CREATE TYPE public.user_role AS ENUM ('user', 'therapist', 'admin');
CREATE TYPE public.journal_type AS ENUM ('free_writing', 'gratitude', 'reflection', 'goal_setting');
CREATE TYPE public.entry_privacy AS ENUM ('private', 'therapist_only', 'anonymous');
CREATE TYPE public.session_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.resource_category AS ENUM ('article', 'video', 'exercise', 'meditation', 'breathing');

-- 2. Core Tables

-- User Profiles (Critical intermediary table)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    display_name TEXT,
    role public.user_role DEFAULT 'user'::public.user_role,
    date_of_birth DATE,
    timezone TEXT DEFAULT 'UTC',
    language TEXT DEFAULT 'fr',
    phone_number TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    preferred_therapist_id UUID,
    is_active BOOLEAN DEFAULT true,
    profile_completion_percentage INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Mood Entries
CREATE TABLE public.mood_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    mood_level public.mood_level NOT NULL,
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
    stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 5),
    sleep_hours DECIMAL(3,1),
    notes TEXT,
    activity_tags TEXT[],
    location TEXT,
    weather TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    entry_date DATE DEFAULT CURRENT_DATE
);

-- Journal Entries
CREATE TABLE public.journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    entry_type public.journal_type DEFAULT 'free_writing'::public.journal_type,
    privacy_level public.entry_privacy DEFAULT 'private'::public.entry_privacy,
    mood_before public.mood_level,
    mood_after public.mood_level,
    tags TEXT[],
    ai_insights TEXT,
    word_count INTEGER,
    sentiment_score DECIMAL(3,2), -- -1.0 to 1.0
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Goals and Achievements
CREATE TABLE public.wellness_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT, -- 'mood', 'sleep', 'exercise', 'meditation', etc.
    target_value INTEGER,
    current_value INTEGER DEFAULT 0,
    target_date DATE,
    is_completed BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    reward_message TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

-- Mental Health Resources
CREATE TABLE public.wellness_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category public.resource_category NOT NULL,
    content_url TEXT,
    thumbnail_url TEXT,
    duration_minutes INTEGER,
    difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 3),
    tags TEXT[],
    is_featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- User Resource Interactions
CREATE TABLE public.user_resource_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES public.wellness_resources(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL, -- 'viewed', 'completed', 'favorited', 'rated'
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    progress_percentage INTEGER DEFAULT 0,
    time_spent_minutes INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, resource_id, interaction_type)
);

-- Support Sessions (for therapist integration)
CREATE TABLE public.support_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    therapist_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    session_date TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    session_type TEXT DEFAULT 'therapy', -- 'therapy', 'check_in', 'crisis_support'
    status public.session_status DEFAULT 'scheduled'::public.session_status,
    notes TEXT,
    session_summary TEXT,
    next_session_date TIMESTAMPTZ,
    is_emergency BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Crisis Support Records
CREATE TABLE public.crisis_support_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    crisis_level INTEGER CHECK (crisis_level >= 1 AND crisis_level <= 5),
    description TEXT,
    support_provided TEXT,
    emergency_contacts_notified BOOLEAN DEFAULT false,
    professional_help_recommended BOOLEAN DEFAULT false,
    follow_up_scheduled BOOLEAN DEFAULT false,
    resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMPTZ
);

-- 3. Essential Indexes
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_mood_entries_user_id ON public.mood_entries(user_id);
CREATE INDEX idx_mood_entries_entry_date ON public.mood_entries(entry_date);
CREATE INDEX idx_mood_entries_created_at ON public.mood_entries(created_at);
CREATE INDEX idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX idx_journal_entries_entry_type ON public.journal_entries(entry_type);
CREATE INDEX idx_journal_entries_created_at ON public.journal_entries(created_at);
CREATE INDEX idx_wellness_goals_user_id ON public.wellness_goals(user_id);
CREATE INDEX idx_wellness_goals_is_active ON public.wellness_goals(is_active);
CREATE INDEX idx_wellness_resources_category ON public.wellness_resources(category);
CREATE INDEX idx_wellness_resources_is_featured ON public.wellness_resources(is_featured);
CREATE INDEX idx_user_resource_interactions_user_id ON public.user_resource_interactions(user_id);
CREATE INDEX idx_support_sessions_user_id ON public.support_sessions(user_id);
CREATE INDEX idx_support_sessions_therapist_id ON public.support_sessions(therapist_id);
CREATE INDEX idx_support_sessions_session_date ON public.support_sessions(session_date);
CREATE INDEX idx_crisis_support_records_user_id ON public.crisis_support_records(user_id);

-- 4. Helper Functions (MUST BE BEFORE RLS POLICIES)
CREATE OR REPLACE FUNCTION public.calculate_mood_streak(user_uuid UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $func$
SELECT COALESCE(
    (
        SELECT COUNT(*)
        FROM (
            SELECT entry_date,
                   LAG(entry_date) OVER (ORDER BY entry_date) as prev_date
            FROM public.mood_entries
            WHERE user_id = user_uuid
                AND entry_date >= CURRENT_DATE - INTERVAL '30 days'
            ORDER BY entry_date DESC
        ) streaks
        WHERE prev_date IS NULL 
           OR entry_date = prev_date + INTERVAL '1 day'
    ), 0
);
$func$;

CREATE OR REPLACE FUNCTION public.get_mood_insights(user_uuid UUID, days_back INTEGER DEFAULT 30)
RETURNS TABLE(
    average_mood DECIMAL,
    mood_trend TEXT,
    best_day TEXT,
    insights TEXT[]
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $func$
BEGIN
    RETURN QUERY
    SELECT 
        ROUND(AVG(
            CASE mood_level
                WHEN 'very_low' THEN 1
                WHEN 'low' THEN 2
                WHEN 'neutral' THEN 3
                WHEN 'good' THEN 4
                WHEN 'excellent' THEN 5
            END
        )::DECIMAL, 2) as average_mood,
        CASE 
            WHEN AVG(
                CASE mood_level
                    WHEN 'very_low' THEN 1
                    WHEN 'low' THEN 2
                    WHEN 'neutral' THEN 3
                    WHEN 'good' THEN 4
                    WHEN 'excellent' THEN 5
                END
            ) >= 4 THEN 'positive'
            WHEN AVG(
                CASE mood_level
                    WHEN 'very_low' THEN 1
                    WHEN 'low' THEN 2
                    WHEN 'neutral' THEN 3
                    WHEN 'good' THEN 4
                    WHEN 'excellent' THEN 5
                END
            ) >= 3 THEN 'stable'
            ELSE 'needs_attention'
        END as mood_trend,
        TO_CHAR(
            (SELECT entry_date FROM public.mood_entries 
             WHERE user_id = user_uuid AND mood_level IN ('good', 'excellent')
             ORDER BY entry_date DESC LIMIT 1), 
            'Day'
        ) as best_day,
        ARRAY['Keep tracking your mood regularly', 'Consider noting activities that improve your mood'] as insights
    FROM public.mood_entries me
    WHERE me.user_id = user_uuid
        AND me.created_at >= CURRENT_TIMESTAMP - (days_back || ' days')::INTERVAL;
END;
$func$;

-- Update profile completion function
CREATE OR REPLACE FUNCTION public.update_profile_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
    completion_score INTEGER := 0;
BEGIN
    -- Calculate completion percentage based on filled fields
    IF NEW.full_name IS NOT NULL THEN completion_score := completion_score + 20; END IF;
    IF NEW.date_of_birth IS NOT NULL THEN completion_score := completion_score + 15; END IF;
    IF NEW.timezone IS NOT NULL THEN completion_score := completion_score + 10; END IF;
    IF NEW.phone_number IS NOT NULL THEN completion_score := completion_score + 15; END IF;
    IF NEW.emergency_contact_name IS NOT NULL THEN completion_score := completion_score + 20; END IF;
    IF NEW.emergency_contact_phone IS NOT NULL THEN completion_score := completion_score + 20; END IF;
    
    NEW.profile_completion_percentage := completion_score;
    NEW.updated_at := CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$func$;

-- Automatic profile creation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $func$
BEGIN
    INSERT INTO public.user_profiles (
        id, 
        email, 
        full_name, 
        display_name,
        role,
        language
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'user'::public.user_role),
        COALESCE(NEW.raw_user_meta_data->>'language', 'fr')
    );
    RETURN NEW;
END;
$func$;

-- 5. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellness_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellness_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_resource_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crisis_support_records ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies

-- Pattern 1: Core user table (user_profiles) - Simple only, no functions
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Pattern 2: Simple user ownership for user data
CREATE POLICY "users_manage_own_mood_entries"
ON public.mood_entries
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_journal_entries"
ON public.journal_entries
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_wellness_goals"
ON public.wellness_goals
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_resource_interactions"
ON public.user_resource_interactions
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_crisis_records"
ON public.crisis_support_records
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Pattern 4: Public read, private write for resources
CREATE POLICY "public_can_read_wellness_resources"
ON public.wellness_resources
FOR SELECT
TO public
USING (true);

-- Admin/therapist can manage resources
CREATE POLICY "admins_manage_wellness_resources"
ON public.wellness_resources
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role IN ('admin', 'therapist')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role IN ('admin', 'therapist')
    )
);

-- Support sessions: users see their own, therapists see their assigned sessions
CREATE POLICY "users_view_own_support_sessions"
ON public.support_sessions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "therapists_manage_assigned_sessions"
ON public.support_sessions
FOR ALL
TO authenticated
USING (
    therapist_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role IN ('admin', 'therapist')
    )
)
WITH CHECK (
    therapist_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role IN ('admin', 'therapist')
    )
);

CREATE POLICY "users_create_support_sessions"
ON public.support_sessions
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 7. Triggers
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_user_profile_completion
    BEFORE INSERT OR UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_profile_completion();

-- 8. Sample Data
DO $$
DECLARE
    demo_user_id UUID := gen_random_uuid();
    therapist_user_id UUID := gen_random_uuid();
    resource1_id UUID := gen_random_uuid();
    resource2_id UUID := gen_random_uuid();
    goal1_id UUID := gen_random_uuid();
BEGIN
    -- Create demo auth users with complete structure
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (demo_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'demo@serenity.com', crypt('demo123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Marie Dubois", "display_name": "Marie", "language": "fr"}'::jsonb, 
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (therapist_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'therapist@serenity.com', crypt('therapist123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Dr. Sophie Laurent", "role": "therapist", "language": "fr"}'::jsonb,
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Sample wellness resources
    INSERT INTO public.wellness_resources (id, title, description, category, duration_minutes, difficulty_level, tags, is_featured) VALUES
        (resource1_id, 'Méditation Guidée: Respiration Consciente', 'Une méditation douce pour se reconnecter à sa respiration et apaiser l''esprit', 'meditation', 10, 1, ARRAY['débutant', 'respiration', 'calme'], true),
        (resource2_id, 'Exercice de Gratitude Quotidien', 'Prenez quelques minutes pour noter trois choses pour lesquelles vous êtes reconnaissant aujourd''hui', 'exercise', 5, 1, ARRAY['gratitude', 'positif', 'quotidien'], true);

    -- Sample mood entries for the demo user
    INSERT INTO public.mood_entries (user_id, mood_level, energy_level, stress_level, notes, activity_tags, entry_date) VALUES
        (demo_user_id, 'good', 4, 2, 'Belle journée ensoleillée, promenade au parc', ARRAY['promenade', 'nature', 'soleil'], CURRENT_DATE),
        (demo_user_id, 'neutral', 3, 3, 'Journée de travail normale', ARRAY['travail', 'routine'], CURRENT_DATE - 1),
        (demo_user_id, 'excellent', 5, 1, 'Temps passé avec la famille, très relaxant', ARRAY['famille', 'détente'], CURRENT_DATE - 2);

    -- Sample journal entry
    INSERT INTO public.journal_entries (user_id, title, content, entry_type, mood_before, mood_after, tags) VALUES
        (demo_user_id, 'Réflexions du soir', 'Aujourd''hui a été une journée intéressante. J''ai réalisé l''importance de prendre du temps pour moi et d''écouter mes besoins. La méditation matinale m''a aidé à commencer la journée avec sérénité.', 'reflection', 'neutral', 'good', ARRAY['méditation', 'réflexion', 'sérénité']);

    -- Sample wellness goal
    INSERT INTO public.wellness_goals (id, user_id, title, description, category, target_value, target_date) VALUES
        (goal1_id, demo_user_id, 'Méditer 7 jours consécutifs', 'Établir une routine de méditation quotidienne pour améliorer mon bien-être mental', 'meditation', 7, CURRENT_DATE + 7);

    -- Sample resource interaction
    INSERT INTO public.user_resource_interactions (user_id, resource_id, interaction_type, progress_percentage, time_spent_minutes) VALUES
        (demo_user_id, resource1_id, 'completed', 100, 10);

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'Unique constraint error: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error: %', SQLERRM;
END $$;

-- 9. Data cleanup function (for testing)
CREATE OR REPLACE FUNCTION public.cleanup_demo_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $cleanup$
DECLARE
    demo_user_ids UUID[];
BEGIN
    -- Get demo user IDs
    SELECT ARRAY_AGG(id) INTO demo_user_ids
    FROM auth.users
    WHERE email LIKE '%@serenity.com';

    -- Delete in dependency order (children first, then auth.users last)
    DELETE FROM public.user_resource_interactions WHERE user_id = ANY(demo_user_ids);
    DELETE FROM public.crisis_support_records WHERE user_id = ANY(demo_user_ids);
    DELETE FROM public.support_sessions WHERE user_id = ANY(demo_user_ids) OR therapist_id = ANY(demo_user_ids);
    DELETE FROM public.wellness_goals WHERE user_id = ANY(demo_user_ids);
    DELETE FROM public.journal_entries WHERE user_id = ANY(demo_user_ids);
    DELETE FROM public.mood_entries WHERE user_id = ANY(demo_user_ids);
    DELETE FROM public.user_profiles WHERE id = ANY(demo_user_ids);
    DELETE FROM public.wellness_resources;

    -- Delete auth.users last
    DELETE FROM auth.users WHERE id = ANY(demo_user_ids);
    
    RAISE NOTICE 'Demo data cleaned up successfully';
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key constraint prevents deletion: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Cleanup failed: %', SQLERRM;
END;
$cleanup$;