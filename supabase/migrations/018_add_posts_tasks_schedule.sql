-- =====================================================
-- HeyMeg: Posts, Tasks, Daily Notes, Inspiration, Schedule
-- Run in Supabase SQL Editor
-- =====================================================
-- These tables match the localStorage models used by
-- Posts, Tasks, Shoots, and Schedule pages.
-- Existing tables (content_items, tasks, notes) are kept
-- for the hidden Content Hub / Planner pages.
-- =====================================================

-- =====================================================
-- USER POSTS (Posts page, Schedule page, Shoots page)
-- =====================================================
-- Matches the Post TypeScript interface exactly
CREATE TABLE IF NOT EXISTS public.user_posts (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  title TEXT NOT NULL DEFAULT '',
  pillar TEXT NOT NULL DEFAULT '',
  format TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Idea'
    CHECK (status IN ('Idea', 'Scripted', 'Ready to shoot', 'Shot', 'Edited', 'Scheduled', 'Posted')),

  scheduled_date DATE,
  script TEXT,
  caption TEXT,
  hashtags TEXT[] DEFAULT '{}',
  attached_files TEXT[] DEFAULT '{}',
  notes TEXT,
  storyboard JSONB DEFAULT '[]'::jsonb,

  -- Metrics (nullable sub-fields)
  metrics_likes INTEGER,
  metrics_comments INTEGER,
  metrics_shares INTEGER,
  metrics_saves INTEGER,
  metrics_reach INTEGER,

  thumbnail_url TEXT,
  sent_to_schedule BOOLEAN DEFAULT false,
  scheduled_time TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,

  -- Shoot link
  shoot_id TEXT,
  sent_to_shoots BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- USER TASKS (Tasks page)
-- =====================================================
-- Matches the Task TypeScript interface
CREATE TABLE IF NOT EXISTS public.user_tasks (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  title TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL,                    -- ISO date string or 'backlog'
  time TEXT,                             -- e.g. '09:00'
  end_time TEXT,                         -- e.g. '10:00'
  duration TEXT,                         -- e.g. '1h 30m'
  tag TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  parent_task_id TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  dismissed BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- USER DAILY NOTES (Tasks page — per-day notes)
-- =====================================================
-- Matches the DailyNote TypeScript interface
CREATE TABLE IF NOT EXISTS public.user_daily_notes (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  date TEXT NOT NULL,                    -- ISO date string
  content TEXT,

  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- USER INSPIRATION (Inspiration panel in Posts page)
-- =====================================================
-- Matches the InspirationItem TypeScript interface
CREATE TABLE IF NOT EXISTS public.user_inspiration (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  url TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'link'
    CHECK (type IN ('link', 'photo', 'file')),
  platform TEXT NOT NULL DEFAULT 'other'
    CHECK (platform IN ('tiktok', 'instagram', 'youtube', 'other')),
  file_name TEXT,
  notes TEXT,

  saved_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- SCHEDULE GRID (Schedule page — slot positions)
-- =====================================================
-- Stores which post is in which grid slot
CREATE TABLE IF NOT EXISTS public.user_schedule_grid (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  slot_index INTEGER NOT NULL,           -- 0-11 (12 slots)
  post_id TEXT REFERENCES public.user_posts(id) ON DELETE SET NULL,

  UNIQUE(user_id, slot_index)
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_user_posts_user_id ON public.user_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_posts_status ON public.user_posts(status);
CREATE INDEX IF NOT EXISTS idx_user_posts_shoot_id ON public.user_posts(shoot_id);
CREATE INDEX IF NOT EXISTS idx_user_posts_scheduled_date ON public.user_posts(scheduled_date);

CREATE INDEX IF NOT EXISTS idx_user_tasks_user_id ON public.user_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_date ON public.user_tasks(date);
CREATE INDEX IF NOT EXISTS idx_user_tasks_parent ON public.user_tasks(parent_task_id);

CREATE INDEX IF NOT EXISTS idx_user_daily_notes_user_id ON public.user_daily_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_notes_date ON public.user_daily_notes(date);

CREATE INDEX IF NOT EXISTS idx_user_inspiration_user_id ON public.user_inspiration(user_id);

CREATE INDEX IF NOT EXISTS idx_user_schedule_grid_user_id ON public.user_schedule_grid(user_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.user_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_daily_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inspiration ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_schedule_grid ENABLE ROW LEVEL SECURITY;

-- user_posts
CREATE POLICY "Users can view own posts"
  ON public.user_posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own posts"
  ON public.user_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts"
  ON public.user_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts"
  ON public.user_posts FOR DELETE USING (auth.uid() = user_id);

-- user_tasks
CREATE POLICY "Users can view own tasks"
  ON public.user_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks"
  ON public.user_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks"
  ON public.user_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks"
  ON public.user_tasks FOR DELETE USING (auth.uid() = user_id);

-- user_daily_notes
CREATE POLICY "Users can view own daily notes"
  ON public.user_daily_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily notes"
  ON public.user_daily_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily notes"
  ON public.user_daily_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own daily notes"
  ON public.user_daily_notes FOR DELETE USING (auth.uid() = user_id);

-- user_inspiration
CREATE POLICY "Users can view own inspiration"
  ON public.user_inspiration FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own inspiration"
  ON public.user_inspiration FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own inspiration"
  ON public.user_inspiration FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own inspiration"
  ON public.user_inspiration FOR DELETE USING (auth.uid() = user_id);

-- user_schedule_grid
CREATE POLICY "Users can view own schedule grid"
  ON public.user_schedule_grid FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own schedule grid"
  ON public.user_schedule_grid FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own schedule grid"
  ON public.user_schedule_grid FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own schedule grid"
  ON public.user_schedule_grid FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- UPDATED_AT TRIGGERS
-- =====================================================
CREATE TRIGGER update_user_posts_updated_at
  BEFORE UPDATE ON public.user_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_tasks_updated_at
  BEFORE UPDATE ON public.user_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_daily_notes_updated_at
  BEFORE UPDATE ON public.user_daily_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
