-- Add timezone column to planner_items
-- Stores the IANA timezone the item was created in (e.g., 'America/Los_Angeles')
-- NULL means legacy item — app treats as user's current timezone (no conversion)
ALTER TABLE public.planner_items
  ADD COLUMN IF NOT EXISTS timezone TEXT;

-- Add timezone columns to production_cards
ALTER TABLE public.production_cards
  ADD COLUMN IF NOT EXISTS scheduled_timezone TEXT,
  ADD COLUMN IF NOT EXISTS planned_timezone TEXT;
