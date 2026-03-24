-- =====================================================
-- Migration 008: Enable Row Level Security on ALL tables
-- Fixes critical Supabase security advisory: rls_disabled_in_public
--
-- Context: Tables from the original schema and migration 002 had
-- RLS disabled. This migration enables RLS and creates policies
-- so users can only access their own data.
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
-- 11. BRAND DEALS
-- =====================================================
ALTER TABLE public.brand_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own brand deals"
  ON public.brand_deals FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own brand deals"
  ON public.brand_deals FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own brand deals"
  ON public.brand_deals FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own brand deals"
  ON public.brand_deals FOR DELETE
  USING (auth.uid()::text = user_id);

-- =====================================================
-- 12. BRAND DEAL DELIVERABLES
--     No direct user_id — secured via parent brand_deals
-- =====================================================
ALTER TABLE public.brand_deal_deliverables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view deliverables for their own brand deals"
  ON public.brand_deal_deliverables FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.brand_deals
    WHERE brand_deals.id = brand_deal_deliverables.brand_deal_id
      AND brand_deals.user_id = auth.uid()::text
  ));

CREATE POLICY "Users can insert deliverables for their own brand deals"
  ON public.brand_deal_deliverables FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.brand_deals
    WHERE brand_deals.id = brand_deal_deliverables.brand_deal_id
      AND brand_deals.user_id = auth.uid()::text
  ));

CREATE POLICY "Users can update deliverables for their own brand deals"
  ON public.brand_deal_deliverables FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.brand_deals
    WHERE brand_deals.id = brand_deal_deliverables.brand_deal_id
      AND brand_deals.user_id = auth.uid()::text
  ));

CREATE POLICY "Users can delete deliverables for their own brand deals"
  ON public.brand_deal_deliverables FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.brand_deals
    WHERE brand_deals.id = brand_deal_deliverables.brand_deal_id
      AND brand_deals.user_id = auth.uid()::text
  ));

-- =====================================================
-- 13. USER STRATEGY
-- =====================================================
ALTER TABLE public.user_strategy ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own strategy"
  ON public.user_strategy FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own strategy"
  ON public.user_strategy FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own strategy"
  ON public.user_strategy FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own strategy"
  ON public.user_strategy FOR DELETE
  USING (auth.uid()::text = user_id);

-- =====================================================
-- 14. USER GOALS
-- =====================================================
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own goals"
  ON public.user_goals FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own goals"
  ON public.user_goals FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own goals"
  ON public.user_goals FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own goals"
  ON public.user_goals FOR DELETE
  USING (auth.uid()::text = user_id);

-- =====================================================
-- 15. PLANNER DAYS
-- =====================================================
ALTER TABLE public.planner_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own planner days"
  ON public.planner_days FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own planner days"
  ON public.planner_days FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own planner days"
  ON public.planner_days FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own planner days"
  ON public.planner_days FOR DELETE
  USING (auth.uid()::text = user_id);

-- =====================================================
-- 16. PLANNER ITEMS
-- =====================================================
ALTER TABLE public.planner_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own planner items"
  ON public.planner_items FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own planner items"
  ON public.planner_items FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own planner items"
  ON public.planner_items FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own planner items"
  ON public.planner_items FOR DELETE
  USING (auth.uid()::text = user_id);

-- =====================================================
-- 17. PRODUCTION CARDS
-- =====================================================
ALTER TABLE public.production_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own production cards"
  ON public.production_cards FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own production cards"
  ON public.production_cards FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own production cards"
  ON public.production_cards FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own production cards"
  ON public.production_cards FOR DELETE
  USING (auth.uid()::text = user_id);

-- =====================================================
-- 18. USER PREFERENCES
-- =====================================================
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own preferences"
  ON public.user_preferences FOR DELETE
  USING (auth.uid()::text = user_id);

-- =====================================================
-- 19. COLLAB BRANDS
-- =====================================================
ALTER TABLE public.collab_brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own collab brands"
  ON public.collab_brands FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own collab brands"
  ON public.collab_brands FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own collab brands"
  ON public.collab_brands FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own collab brands"
  ON public.collab_brands FOR DELETE
  USING (auth.uid()::text = user_id);

-- =====================================================
-- 20. COLLAB COLUMNS
-- =====================================================
ALTER TABLE public.collab_columns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own collab columns"
  ON public.collab_columns FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own collab columns"
  ON public.collab_columns FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own collab columns"
  ON public.collab_columns FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own collab columns"
  ON public.collab_columns FOR DELETE
  USING (auth.uid()::text = user_id);

-- =====================================================
-- 21. CONTENT IDEAS
-- =====================================================
ALTER TABLE public.content_ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own content ideas"
  ON public.content_ideas FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own content ideas"
  ON public.content_ideas FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own content ideas"
  ON public.content_ideas FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own content ideas"
  ON public.content_ideas FOR DELETE
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
GRANT SELECT, INSERT, UPDATE, DELETE ON public.brand_deals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.brand_deal_deliverables TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_strategy TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_goals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.planner_days TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.planner_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.production_cards TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collab_brands TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collab_columns TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_ideas TO authenticated;

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
REVOKE ALL ON public.brand_deals FROM anon;
REVOKE ALL ON public.brand_deal_deliverables FROM anon;
REVOKE ALL ON public.user_strategy FROM anon;
REVOKE ALL ON public.user_goals FROM anon;
REVOKE ALL ON public.planner_days FROM anon;
REVOKE ALL ON public.planner_items FROM anon;
REVOKE ALL ON public.production_cards FROM anon;
REVOKE ALL ON public.user_preferences FROM anon;
REVOKE ALL ON public.collab_brands FROM anon;
REVOKE ALL ON public.collab_columns FROM anon;
REVOKE ALL ON public.content_ideas FROM anon;
