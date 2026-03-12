-- =====================================================
-- SIMPLE MIGRATION: Just create the 3 tables we need
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 1. QUICK NOTES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.quick_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quick_notes_user_id ON public.quick_notes(user_id);
ALTER TABLE public.quick_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own quick notes"
  ON public.quick_notes FOR ALL
  USING (auth.uid() = user_id);

CREATE TRIGGER update_quick_notes_updated_at
  BEFORE UPDATE ON public.quick_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. VISION BOARD TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.vision_board_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vision_board_user_id ON public.vision_board_items(user_id);
ALTER TABLE public.vision_board_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own vision board items"
  ON public.vision_board_items FOR ALL
  USING (auth.uid() = user_id);

CREATE TRIGGER update_vision_board_items_updated_at
  BEFORE UPDATE ON public.vision_board_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. RESEARCH ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.research_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_research_items_user_id ON public.research_items(user_id);
ALTER TABLE public.research_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own research items"
  ON public.research_items FOR ALL
  USING (auth.uid() = user_id);

CREATE TRIGGER update_research_items_updated_at
  BEFORE UPDATE ON public.research_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Done!
-- This creates 3 tables: quick_notes, vision_board_items, research_items
-- All with Row Level Security enabled so users only see their own data
