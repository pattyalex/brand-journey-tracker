-- Drop unused content_values column from user_strategy
ALTER TABLE public.user_strategy DROP COLUMN IF EXISTS content_values;
