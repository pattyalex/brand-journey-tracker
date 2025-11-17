-- Update content schema to match application structure
-- Run this in Supabase SQL Editor to update the content_items and content_pillars tables

-- First, check if the tables exist and update them
-- If they don't match the structure we need, this will add the missing columns

-- Update content_pillars table
ALTER TABLE content_pillars
  DROP COLUMN IF EXISTS title CASCADE,
  DROP COLUMN IF EXISTS color CASCADE;

ALTER TABLE content_pillars
  ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT 'Untitled Pillar',
  ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#3B82F6',
  ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS writing_space TEXT DEFAULT '';

-- Update content_items table to match ContentItem interface
ALTER TABLE content_items
  DROP COLUMN IF EXISTS content CASCADE,
  DROP COLUMN IF EXISTS status CASCADE;

ALTER TABLE content_items
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS url TEXT, -- Stores serialized JSON with script, visualNotes, etc.
  ADD COLUMN IF NOT EXISTS format TEXT DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS platforms TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'idea',
  ADD COLUMN IF NOT EXISTS shoot_details TEXT,
  ADD COLUMN IF NOT EXISTS caption TEXT,
  ADD COLUMN IF NOT EXISTS bucket_id TEXT,
  ADD COLUMN IF NOT EXISTS original_pillar_id UUID,
  ADD COLUMN IF NOT EXISTS is_restored BOOLEAN DEFAULT FALSE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_content_items_pillar_id ON content_items(pillar_id);
CREATE INDEX IF NOT EXISTS idx_content_items_user_status ON content_items(user_id, status);
CREATE INDEX IF NOT EXISTS idx_content_items_scheduled_date ON content_items(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_content_pillars_user_position ON content_pillars(user_id, position);

-- Success message
SELECT 'Content schema updated successfully!' as message;
