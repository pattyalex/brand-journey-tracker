-- =====================================================
-- Migration 008: Enable Row Level Security on ALL tables
-- Fixes critical Supabase security advisory: rls_disabled_in_public
--
-- Only covers the 10 tables that currently exist WITHOUT RLS.
-- Tables already secured (quick_notes, research_items,
-- vision_board_items, user_onboarding_responses, email_subscriptions)
-- are skipped.
--
-- NOTE: The service_role key (used by Stripe webhooks) bypasses
-- RLS automatically — no changes needed for server-side operations.
-- =====================================================

-- =====================================================
-- 1. PROFILES TABLE
--    id column is TEXT (stores Supabase auth UUID as text)
-- =====================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid()::text = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid()::text = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Users can delete their own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid()::text = id);

-- =====================================================
-- 2. CONTENT PILLARS
-- =====================================================
ALTER TABLE public.content_pillars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own content pillars"
  ON public.content_pillars FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own content pillars"
  ON public.content_pillars FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own content pillars"
  ON public.content_pillars FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own content pillars"
  ON public.content_pillars FOR DELETE
  USING (auth.uid()::text = user_id);

-- =====================================================
-- 3. CONTENT ITEMS
-- =====================================================
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own content items"
  ON public.content_items FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own content items"
  ON public.content_items FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own content items"
  ON public.content_items FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own content items"
  ON public.content_items FOR DELETE
  USING (auth.uid()::text = user_id);

-- =====================================================
-- 4. CALENDAR EVENTS
-- =====================================================
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own calendar events"
  ON public.calendar_events FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own calendar events"
  ON public.calendar_events FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own calendar events"
  ON public.calendar_events FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own calendar events"
  ON public.calendar_events FOR DELETE
  USING (auth.uid()::text = user_id);

-- =====================================================
-- 5. COLLABORATIONS
-- =====================================================
ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own collaborations"
  ON public.collaborations FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own collaborations"
  ON public.collaborations FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own collaborations"
  ON public.collaborations FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own collaborations"
  ON public.collaborations FOR DELETE
  USING (auth.uid()::text = user_id);

-- =====================================================
-- 6. TASKS
-- =====================================================
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks"
  ON public.tasks FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON public.tasks FOR DELETE
  USING (auth.uid()::text = user_id);

-- =====================================================
-- 7. NOTES
-- =====================================================
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notes"
  ON public.notes FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own notes"
  ON public.notes FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own notes"
  ON public.notes FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own notes"
  ON public.notes FOR DELETE
  USING (auth.uid()::text = user_id);

-- =====================================================
-- 8. ANALYTICS
-- =====================================================
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analytics"
  ON public.analytics FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own analytics"
  ON public.analytics FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own analytics"
  ON public.analytics FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own analytics"
  ON public.analytics FOR DELETE
  USING (auth.uid()::text = user_id);

-- =====================================================
-- 9. SOCIAL ACCOUNTS (contains sensitive OAuth tokens)
-- =====================================================
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own social accounts"
  ON public.social_accounts FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own social accounts"
  ON public.social_accounts FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own social accounts"
  ON public.social_accounts FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own social accounts"
  ON public.social_accounts FOR DELETE
  USING (auth.uid()::text = user_id);

-- =====================================================
-- 10. SETTINGS
-- =====================================================
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings"
  ON public.settings FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own settings"
  ON public.settings FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own settings"
  ON public.settings FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own settings"
  ON public.settings FOR DELETE
  USING (auth.uid()::text = user_id);

-- =====================================================
-- GRANT PERMISSIONS
-- Ensure authenticated users can perform operations
-- (RLS policies will restrict which rows they can access)
-- =====================================================
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

-- =====================================================
-- REVOKE anonymous access on sensitive tables
-- (anon role should NOT be able to read user data)
-- =====================================================
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
