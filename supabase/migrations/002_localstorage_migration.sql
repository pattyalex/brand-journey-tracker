-- =====================================================
-- LOCALSTORAGE TO SUPABASE MIGRATION
-- Migration file: 002_localstorage_migration.sql
-- Note: RLS disabled since app uses Clerk (not Supabase Auth)
-- =====================================================

-- =====================================================
-- BRAND DEALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.brand_deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  brand_name TEXT NOT NULL,
  product_campaign TEXT,
  contact_person TEXT,
  contact_email TEXT,
  status TEXT DEFAULT 'inbound',
  custom_status TEXT,
  contract_file JSONB,
  total_fee DECIMAL(10, 2) DEFAULT 0,
  deposit_amount DECIMAL(10, 2) DEFAULT 0,
  deposit_paid BOOLEAN DEFAULT false,
  deposit_paid_date DATE,
  final_payment_due_date DATE,
  invoice_sent BOOLEAN DEFAULT false,
  invoice_sent_date DATE,
  payment_received BOOLEAN DEFAULT false,
  payment_received_date DATE,
  campaign_start DATE,
  campaign_end DATE,
  notes TEXT,
  is_archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMPTZ
);

-- Brand deal deliverables
CREATE TABLE IF NOT EXISTS public.brand_deal_deliverables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_deal_id UUID NOT NULL REFERENCES public.brand_deals(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  title TEXT NOT NULL,
  content_type TEXT,
  custom_content_type TEXT,
  submission_deadline DATE,
  publish_deadline DATE,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  is_submitted BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  is_paid BOOLEAN DEFAULT false,
  payment_amount DECIMAL(10, 2),
  paid_date DATE
);

-- =====================================================
-- USER STRATEGY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_strategy (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  brand_values JSONB DEFAULT '[]'::jsonb,
  mission_statement TEXT,
  content_values TEXT,
  vision_board_data JSONB DEFAULT '{"images": [], "pinterestUrl": ""}'::jsonb,
  strategy_notes TEXT,
  strategy_note_links JSONB DEFAULT '[]'::jsonb,
  strategy_note_files JSONB DEFAULT '[]'::jsonb
);

-- =====================================================
-- GOALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  goal_type TEXT NOT NULL,
  year INTEGER,
  month INTEGER,
  text TEXT NOT NULL,
  status TEXT DEFAULT 'not-started',
  progress_note TEXT,
  display_order INTEGER DEFAULT 0
);

-- =====================================================
-- PLANNER TABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.planner_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  great_day TEXT,
  grateful TEXT,
  tasks TEXT,

  UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS public.planner_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  planner_day_id UUID REFERENCES public.planner_days(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  text TEXT NOT NULL,
  section TEXT,
  is_completed BOOLEAN DEFAULT false,
  date DATE,
  start_time TIME,
  end_time TIME,
  description TEXT,
  location TEXT,
  color TEXT,
  display_order INTEGER DEFAULT 0,
  is_content_calendar BOOLEAN DEFAULT false,
  is_placeholder BOOLEAN DEFAULT false,
  is_global_task BOOLEAN DEFAULT false
);

-- =====================================================
-- PRODUCTION KANBAN TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.production_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  column_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  added_from TEXT,
  platforms JSONB DEFAULT '[]'::jsonb,
  formats JSONB DEFAULT '[]'::jsonb,
  script TEXT,
  hook TEXT,
  location_checked BOOLEAN DEFAULT false,
  location_text TEXT,
  outfit_checked BOOLEAN DEFAULT false,
  outfit_text TEXT,
  props_checked BOOLEAN DEFAULT false,
  props_text TEXT,
  filming_notes TEXT,
  status TEXT,
  is_pinned BOOLEAN DEFAULT false,
  storyboard JSONB DEFAULT '[]'::jsonb,
  editing_checklist JSONB,
  custom_video_formats JSONB DEFAULT '[]'::jsonb,
  custom_photo_formats JSONB DEFAULT '[]'::jsonb,
  scheduling_status TEXT,
  scheduled_date DATE,
  scheduled_start_time TIME,
  scheduled_end_time TIME,
  scheduled_color TEXT,
  planned_date DATE,
  planned_start_time TIME,
  planned_end_time TIME,
  planned_color TEXT,
  from_calendar BOOLEAN DEFAULT false,
  brain_dump_handled_text TEXT,
  calendar_only BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0
);

-- =====================================================
-- USER PREFERENCES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  selected_timezone TEXT DEFAULT 'auto',
  today_zoom_level DECIMAL(3, 2) DEFAULT 1.0,
  weekly_zoom_level DECIMAL(3, 2) DEFAULT 1.0,
  today_scroll_position INTEGER DEFAULT 0,
  weekly_scroll_position INTEGER DEFAULT 0,
  planner_last_access_date DATE,
  planner_color_palette JSONB DEFAULT '[]'::jsonb,
  selected_task_palette TEXT,
  sidebar_state JSONB DEFAULT '{}'::jsonb,
  sidebar_menu_items JSONB DEFAULT '[]'::jsonb,
  content_formats JSONB DEFAULT '[]'::jsonb,
  platform_usernames JSONB DEFAULT '{}'::jsonb,
  custom_hooks JSONB DEFAULT '[]'::jsonb,
  editor_checklist_items JSONB DEFAULT '[]'::jsonb,
  has_completed_onboarding BOOLEAN DEFAULT false,
  has_seen_goals_onboarding BOOLEAN DEFAULT false
);

-- =====================================================
-- COLLAB TABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.collab_brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  brand_name TEXT NOT NULL,
  contact TEXT,
  product TEXT,
  status TEXT,
  deliverables TEXT,
  brief_contract TEXT,
  rate TEXT,
  post_date TEXT,
  deposit_paid TEXT,
  final_payment_due_date TEXT,
  invoice_sent TEXT,
  payment_received TEXT,
  notes TEXT,
  custom_data JSONB DEFAULT '{}'::jsonb,
  display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.collab_columns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  column_key TEXT NOT NULL,
  title TEXT NOT NULL,
  editable BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,

  UNIQUE(user_id, column_key)
);

-- =====================================================
-- CONTENT IDEAS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.content_ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pillar_id UUID REFERENCES public.content_pillars(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  title TEXT NOT NULL,
  description TEXT,
  source TEXT,
  is_pinned BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_brand_deals_user_id ON public.brand_deals(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_deals_status ON public.brand_deals(status);
CREATE INDEX IF NOT EXISTS idx_brand_deal_deliverables_deal_id ON public.brand_deal_deliverables(brand_deal_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON public.user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_type ON public.user_goals(goal_type);
CREATE INDEX IF NOT EXISTS idx_planner_days_user_date ON public.planner_days(user_id, date);
CREATE INDEX IF NOT EXISTS idx_planner_items_user_id ON public.planner_items(user_id);
CREATE INDEX IF NOT EXISTS idx_production_cards_user_id ON public.production_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_production_cards_column ON public.production_cards(column_id);
CREATE INDEX IF NOT EXISTS idx_collab_brands_user_id ON public.collab_brands(user_id);
CREATE INDEX IF NOT EXISTS idx_content_ideas_user_id ON public.content_ideas(user_id);

-- =====================================================
-- UPDATE TRIGGERS (using existing function)
-- =====================================================
CREATE TRIGGER update_brand_deals_updated_at
  BEFORE UPDATE ON public.brand_deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_deal_deliverables_updated_at
  BEFORE UPDATE ON public.brand_deal_deliverables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_strategy_updated_at
  BEFORE UPDATE ON public.user_strategy
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_goals_updated_at
  BEFORE UPDATE ON public.user_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_planner_days_updated_at
  BEFORE UPDATE ON public.planner_days
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_planner_items_updated_at
  BEFORE UPDATE ON public.planner_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_production_cards_updated_at
  BEFORE UPDATE ON public.production_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collab_brands_updated_at
  BEFORE UPDATE ON public.collab_brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collab_columns_updated_at
  BEFORE UPDATE ON public.collab_columns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_ideas_updated_at
  BEFORE UPDATE ON public.content_ideas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
