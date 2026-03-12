-- =====================================================
-- Migration 003: Add Missing Tables for Active Features
-- Quick Notes, Vision Board, Research, and Archive support
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- QUICK NOTES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.quick_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_quick_notes_user_id ON public.quick_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_quick_notes_created_at ON public.quick_notes(created_at DESC);

-- RLS Policies
ALTER TABLE public.quick_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quick notes"
  ON public.quick_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quick notes"
  ON public.quick_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quick notes"
  ON public.quick_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quick notes"
  ON public.quick_notes FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- VISION BOARD ITEMS
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

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_vision_board_user_id ON public.vision_board_items(user_id);
CREATE INDEX IF NOT EXISTS idx_vision_board_order ON public.vision_board_items(user_id, display_order);

-- RLS Policies
ALTER TABLE public.vision_board_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vision board items"
  ON public.vision_board_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vision board items"
  ON public.vision_board_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vision board items"
  ON public.vision_board_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vision board items"
  ON public.vision_board_items FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- RESEARCH ITEMS
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

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_research_items_user_id ON public.research_items(user_id);
CREATE INDEX IF NOT EXISTS idx_research_items_tags ON public.research_items USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_research_items_created_at ON public.research_items(created_at DESC);

-- RLS Policies
ALTER TABLE public.research_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own research items"
  ON public.research_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own research items"
  ON public.research_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own research items"
  ON public.research_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own research items"
  ON public.research_items FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- UPDATE PRODUCTION_CARDS - Add archive support
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'production_cards' AND column_name = 'archived'
  ) THEN
    ALTER TABLE public.production_cards
    ADD COLUMN archived BOOLEAN DEFAULT FALSE,
    ADD COLUMN archived_at TIMESTAMPTZ;

    CREATE INDEX IF NOT EXISTS idx_production_cards_archived ON public.production_cards(user_id, archived);
  END IF;
END $$;

-- =====================================================
-- UPDATED_AT TRIGGERS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Quick Notes trigger
DROP TRIGGER IF EXISTS update_quick_notes_updated_at ON public.quick_notes;
CREATE TRIGGER update_quick_notes_updated_at
  BEFORE UPDATE ON public.quick_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Vision Board trigger
DROP TRIGGER IF EXISTS update_vision_board_items_updated_at ON public.vision_board_items;
CREATE TRIGGER update_vision_board_items_updated_at
  BEFORE UPDATE ON public.vision_board_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Research Items trigger
DROP TRIGGER IF EXISTS update_research_items_updated_at ON public.research_items;
CREATE TRIGGER update_research_items_updated_at
  BEFORE UPDATE ON public.research_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT ALL ON public.quick_notes TO authenticated;
GRANT ALL ON public.vision_board_items TO authenticated;
GRANT ALL ON public.research_items TO authenticated;
