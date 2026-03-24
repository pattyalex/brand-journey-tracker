-- Add has_used_trial column to track whether a user has already used their free trial
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_used_trial BOOLEAN DEFAULT false;

-- Backfill: any user who has ever had a subscription has used their trial
UPDATE public.profiles SET has_used_trial = true
WHERE stripe_subscription_id IS NOT NULL OR subscription_status IS NOT NULL;
