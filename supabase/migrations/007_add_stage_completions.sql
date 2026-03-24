-- Add stage_completions JSONB column to production_cards
-- Tracks user-controlled stage completion for the content creation workflow
ALTER TABLE public.production_cards
ADD COLUMN IF NOT EXISTS stage_completions JSONB DEFAULT '{"ideate":false,"scriptAndConcept":false,"toFilm":false,"toEdit":false,"toSchedule":false}'::jsonb;
