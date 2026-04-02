-- Extract three_year_vision from vision_board_data JSON into its own column
ALTER TABLE public.user_strategy
  ADD COLUMN IF NOT EXISTS three_year_vision TEXT;

-- Backfill from existing JSON
UPDATE public.user_strategy
  SET three_year_vision = vision_board_data->>'threeYearVision'
  WHERE vision_board_data->>'threeYearVision' IS NOT NULL
    AND vision_board_data->>'threeYearVision' != '';

-- Strip threeYearVision key from the JSON column
UPDATE public.user_strategy
  SET vision_board_data = vision_board_data - 'threeYearVision'
  WHERE vision_board_data ? 'threeYearVision';
