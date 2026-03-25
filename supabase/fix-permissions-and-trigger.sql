-- =====================================================
-- HeyMeg: Fix permissions, trigger, and missing columns
-- Run this ONCE in Supabase SQL Editor (dashboard)
-- =====================================================
-- This script is SAFE to run multiple times (all statements are idempotent).

-- =====================================================
-- 1. Add missing columns to profiles (if they don't exist)
-- =====================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_used_trial BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- =====================================================
-- 2. Ensure the handle_new_user() trigger exists
--    This automatically creates a profile when a user signs up.
--    SECURITY DEFINER = runs as postgres, bypasses RLS.
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, is_on_trial, trial_ends_at, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    true,
    NOW() + INTERVAL '14 days',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger to make sure it's attached
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 3. Enable RLS on all tables
-- =====================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_pillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. Drop ALL existing policies (clean slate — prevents duplicates)
-- =====================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- =====================================================
-- 5. Create RLS policies
--    profiles.id is the Supabase auth user UUID (stored as UUID or TEXT).
--    auth.uid()::text handles both column types.
-- =====================================================

-- Profiles
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid()::text = id::text);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "profiles_delete" ON public.profiles FOR DELETE USING (auth.uid()::text = id::text);

-- Content pillars
CREATE POLICY "content_pillars_all" ON public.content_pillars FOR ALL USING (auth.uid()::text = user_id::text);

-- Content items
CREATE POLICY "content_items_all" ON public.content_items FOR ALL USING (auth.uid()::text = user_id::text);

-- Calendar events
CREATE POLICY "calendar_events_all" ON public.calendar_events FOR ALL USING (auth.uid()::text = user_id::text);

-- Collaborations
CREATE POLICY "collaborations_all" ON public.collaborations FOR ALL USING (auth.uid()::text = user_id::text);

-- Tasks
CREATE POLICY "tasks_all" ON public.tasks FOR ALL USING (auth.uid()::text = user_id::text);

-- Notes
CREATE POLICY "notes_all" ON public.notes FOR ALL USING (auth.uid()::text = user_id::text);

-- Analytics
CREATE POLICY "analytics_all" ON public.analytics FOR ALL USING (auth.uid()::text = user_id::text);

-- Social accounts
CREATE POLICY "social_accounts_all" ON public.social_accounts FOR ALL USING (auth.uid()::text = user_id::text);

-- Settings
CREATE POLICY "settings_all" ON public.settings FOR ALL USING (auth.uid()::text = user_id::text);

-- =====================================================
-- 6. Grant permissions
--    authenticated = logged-in users (RLS restricts to own rows)
--    anon = NOT logged-in (revoke access to user data)
-- =====================================================

-- Schema-level grants
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Authenticated users can access all tables (RLS limits to own rows)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_pillars TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collaborations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.analytics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.settings TO authenticated;

-- Revoke anon access on all user-data tables
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.content_pillars FROM anon;
REVOKE ALL ON public.content_items FROM anon;
REVOKE ALL ON public.calendar_events FROM anon;
REVOKE ALL ON public.collaborations FROM anon;
REVOKE ALL ON public.tasks FROM anon;
REVOKE ALL ON public.notes FROM anon;
REVOKE ALL ON public.analytics FROM anon;
REVOKE ALL ON public.social_accounts FROM anon;
REVOKE ALL ON public.settings FROM anon;

-- Allow anon to insert into email_subscriptions (landing page signups)
-- Only if the table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email_subscriptions') THEN
    EXECUTE 'GRANT INSERT ON public.email_subscriptions TO anon';
  END IF;
END $$;

-- Sequences (needed for UUID generation)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Default privileges for any future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO authenticated;

-- =====================================================
-- 7. Ensure updated_at triggers exist
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'profiles', 'content_pillars', 'content_items', 'calendar_events',
    'collaborations', 'tasks', 'notes', 'analytics', 'social_accounts', 'settings'
  ]) LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl) THEN
      EXECUTE format('DROP TRIGGER IF EXISTS update_%s_updated_at ON public.%I', tbl, tbl);
      EXECUTE format('CREATE TRIGGER update_%s_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', tbl, tbl);
    END IF;
  END LOOP;
END $$;

-- =====================================================
-- DONE. Profile creation now works like this:
--   1. User signs up via Supabase Auth
--   2. handle_new_user() trigger auto-creates their profile (bypasses RLS)
--   3. Client code does NOT insert profiles — only reads/updates them
--   4. Server (service_role key) can update profiles for Stripe webhooks etc.
-- =====================================================
