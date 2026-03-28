-- Add content pillar/theme fields to user_preferences
ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS pillar_themes text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS pillar_sub_categories jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS pillar_cascade_ideas text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS pillar_selected_theme text DEFAULT '',
  ADD COLUMN IF NOT EXISTS pillar_selected_sub_category text DEFAULT '';
