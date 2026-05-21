-- Add "Ready to Schedule" status to user_posts
ALTER TABLE public.user_posts
  DROP CONSTRAINT IF EXISTS user_posts_status_check;

ALTER TABLE public.user_posts
  ADD CONSTRAINT user_posts_status_check
  CHECK (status IN ('Idea', 'Scripted', 'Ready to shoot', 'Shot', 'Edited', 'Ready to Schedule', 'Scheduled', 'Posted'));

-- Migrate existing posts that were sent_to_schedule but not yet scheduled
UPDATE public.user_posts
  SET status = 'Ready to Schedule'
  WHERE sent_to_schedule = true
    AND status = 'Edited'
    AND scheduled_date IS NULL;
