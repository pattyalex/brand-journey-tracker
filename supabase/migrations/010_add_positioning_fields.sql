-- =====================================================
-- ADD POSITIONING FIELDS TO USER_STRATEGY
-- Adds: selected_tones, audience_age_ranges, audience_struggles, audience_desires
-- =====================================================

ALTER TABLE public.user_strategy
  ADD COLUMN IF NOT EXISTS selected_tones JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS audience_age_ranges JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS audience_struggles TEXT,
  ADD COLUMN IF NOT EXISTS audience_desires TEXT;
