-- Add planner view and content display mode preferences
ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS planner_current_view TEXT DEFAULT 'today',
  ADD COLUMN IF NOT EXISTS planner_content_display_mode TEXT DEFAULT 'both';
