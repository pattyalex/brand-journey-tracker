-- =====================================================
-- Brand Journey Tracker - Initial Database Schema
-- =====================================================
-- This migration creates all necessary tables for the application
-- with proper relationships and Row Level Security (RLS) policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE
-- =====================================================
-- User profile information with trial and subscription details
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- User information
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,

  -- Trial and subscription
  is_on_trial BOOLEAN DEFAULT true,
  trial_ends_at TIMESTAMPTZ,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  subscription_status TEXT,
  plan_type TEXT,

  -- Settings
  timezone TEXT DEFAULT 'UTC',
  preferences JSONB DEFAULT '{}'::jsonb
);

-- =====================================================
-- CONTENT PILLARS TABLE
-- =====================================================
-- Content themes/categories for organizing content strategy
CREATE TABLE IF NOT EXISTS public.content_pillars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT,
  position INTEGER DEFAULT 0
);

-- =====================================================
-- CONTENT ITEMS TABLE
-- =====================================================
-- Main content management table
CREATE TABLE IF NOT EXISTS public.content_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pillar_id UUID REFERENCES public.content_pillars(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Content details
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT, -- 'reel', 'post', 'story', 'video', 'blog', etc.
  status TEXT DEFAULT 'idea', -- 'idea', 'draft', 'scheduled', 'published', 'archived'

  -- Rich content
  script TEXT,
  caption TEXT,
  visual_notes TEXT,
  shoot_details JSONB,

  -- Scheduling
  scheduled_date TIMESTAMPTZ,
  published_date TIMESTAMPTZ,

  -- Platforms
  platforms TEXT[] DEFAULT '{}',

  -- Tags and categorization
  tags TEXT[] DEFAULT '{}',
  bucket TEXT, -- Custom bucket/category

  -- Inspiration/references
  inspiration_links TEXT[] DEFAULT '{}',
  inspiration_images TEXT[] DEFAULT '{}',

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- =====================================================
-- CALENDAR EVENTS TABLE
-- =====================================================
-- Calendar and scheduling information
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_item_id UUID REFERENCES public.content_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT, -- 'content', 'task', 'meeting', 'deadline', etc.
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  all_day BOOLEAN DEFAULT false,

  -- Recurrence
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT,

  -- Platform specific
  platform TEXT,

  metadata JSONB DEFAULT '{}'::jsonb
);

-- =====================================================
-- COLLABORATIONS TABLE
-- =====================================================
-- Brand partnerships and collaborations
CREATE TABLE IF NOT EXISTS public.collaborations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Brand information
  brand_name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,

  -- Collaboration details
  campaign_name TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'negotiating', 'confirmed', 'in_progress', 'completed', 'cancelled'
  contract_signed BOOLEAN DEFAULT false,
  brief_received BOOLEAN DEFAULT false,

  -- Dates
  start_date DATE,
  post_date DATE,
  deadline DATE,

  -- Payment
  payment_amount DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  deposit_paid BOOLEAN DEFAULT false,
  deposit_amount DECIMAL(10, 2),
  final_payment_due DATE,
  payment_received BOOLEAN DEFAULT false,
  invoice_sent BOOLEAN DEFAULT false,

  -- Deliverables
  deliverables TEXT[],
  platforms TEXT[],

  -- Notes and files
  notes TEXT,
  files TEXT[], -- URLs to uploaded files

  metadata JSONB DEFAULT '{}'::jsonb
);

-- =====================================================
-- TASKS TABLE
-- =====================================================
-- Task management and to-dos
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_item_id UUID REFERENCES public.content_items(id) ON DELETE SET NULL,
  collaboration_id UUID REFERENCES public.collaborations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo', -- 'todo', 'in_progress', 'completed', 'blocked'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'

  -- Dates
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Organization
  category TEXT,
  tags TEXT[] DEFAULT '{}',

  -- Subtasks
  checklist JSONB DEFAULT '[]'::jsonb,

  metadata JSONB DEFAULT '{}'::jsonb
);

-- =====================================================
-- NOTES TABLE
-- =====================================================
-- Quick notes and brain dumps
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  title TEXT,
  content TEXT NOT NULL,
  note_type TEXT DEFAULT 'note', -- 'note', 'braindump', 'idea'

  -- Organization
  tags TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT false,

  -- Linking
  linked_content_id UUID REFERENCES public.content_items(id) ON DELETE SET NULL,
  linked_collab_id UUID REFERENCES public.collaborations(id) ON DELETE SET NULL,

  metadata JSONB DEFAULT '{}'::jsonb
);

-- =====================================================
-- ANALYTICS TABLE
-- =====================================================
-- Performance tracking for published content
CREATE TABLE IF NOT EXISTS public.analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_item_id UUID REFERENCES public.content_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  platform TEXT NOT NULL,
  post_url TEXT,

  -- Metrics
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5, 2),

  -- Timestamp
  measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  metadata JSONB DEFAULT '{}'::jsonb
);

-- =====================================================
-- SOCIAL ACCOUNTS TABLE
-- =====================================================
-- Connected social media accounts
CREATE TABLE IF NOT EXISTS public.social_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  platform TEXT NOT NULL, -- 'instagram', 'tiktok', 'youtube', 'linkedin', 'twitter'
  handle TEXT NOT NULL,
  is_connected BOOLEAN DEFAULT false,

  -- OAuth tokens (encrypted in production)
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,

  -- Account info
  profile_data JSONB DEFAULT '{}'::jsonb,

  UNIQUE(user_id, platform)
);

-- =====================================================
-- SETTINGS TABLE
-- =====================================================
-- User application settings
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- API Keys (stored encrypted)
  openai_api_key TEXT,
  firecrawl_api_key TEXT,

  -- Preferences
  theme TEXT DEFAULT 'system',
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,

  -- AI Settings
  ai_suggestions_enabled BOOLEAN DEFAULT true,

  settings_data JSONB DEFAULT '{}'::jsonb
);

-- =====================================================
-- INDEXES
-- =====================================================
-- Performance indexes for common queries

CREATE INDEX idx_content_items_user_id ON public.content_items(user_id);
CREATE INDEX idx_content_items_status ON public.content_items(status);
CREATE INDEX idx_content_items_pillar_id ON public.content_items(pillar_id);
CREATE INDEX idx_content_items_scheduled_date ON public.content_items(scheduled_date);

CREATE INDEX idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX idx_calendar_events_start_time ON public.calendar_events(start_time);

CREATE INDEX idx_collaborations_user_id ON public.collaborations(user_id);
CREATE INDEX idx_collaborations_status ON public.collaborations(status);

CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);

CREATE INDEX idx_notes_user_id ON public.notes(user_id);
CREATE INDEX idx_analytics_user_id ON public.analytics(user_id);
CREATE INDEX idx_social_accounts_user_id ON public.social_accounts(user_id);

-- =====================================================
-- UPDATED_AT TRIGGERS
-- =====================================================
-- Auto-update updated_at timestamp

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_pillars_updated_at BEFORE UPDATE ON public.content_pillars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_items_updated_at BEFORE UPDATE ON public.content_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collaborations_updated_at BEFORE UPDATE ON public.collaborations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_updated_at BEFORE UPDATE ON public.analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_accounts_updated_at BEFORE UPDATE ON public.social_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- Enable RLS on all tables

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

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Content pillars policies
CREATE POLICY "Users can manage own pillars" ON public.content_pillars
  FOR ALL USING (auth.uid() = user_id);

-- Content items policies
CREATE POLICY "Users can manage own content" ON public.content_items
  FOR ALL USING (auth.uid() = user_id);

-- Calendar events policies
CREATE POLICY "Users can manage own events" ON public.calendar_events
  FOR ALL USING (auth.uid() = user_id);

-- Collaborations policies
CREATE POLICY "Users can manage own collaborations" ON public.collaborations
  FOR ALL USING (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "Users can manage own tasks" ON public.tasks
  FOR ALL USING (auth.uid() = user_id);

-- Notes policies
CREATE POLICY "Users can manage own notes" ON public.notes
  FOR ALL USING (auth.uid() = user_id);

-- Analytics policies
CREATE POLICY "Users can manage own analytics" ON public.analytics
  FOR ALL USING (auth.uid() = user_id);

-- Social accounts policies
CREATE POLICY "Users can manage own social accounts" ON public.social_accounts
  FOR ALL USING (auth.uid() = user_id);

-- Settings policies
CREATE POLICY "Users can manage own settings" ON public.settings
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to create user profile automatically on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- SEED DATA (Optional)
-- =====================================================
-- You can add default content pillars or settings here if needed
