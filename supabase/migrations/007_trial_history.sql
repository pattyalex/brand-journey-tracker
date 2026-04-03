-- Trial history: permanent record of emails that have used a free trial.
-- Survives account deletion to prevent trial abuse.

CREATE TABLE IF NOT EXISTS public.trial_history (
  email text PRIMARY KEY,
  first_trial_started_at timestamptz DEFAULT now()
);

ALTER TABLE public.trial_history ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert (recorded when subscription is created)
CREATE POLICY "Allow authenticated inserts" ON public.trial_history
  FOR INSERT TO authenticated WITH CHECK (true);

-- Allow service role full access (for trigger usage)
GRANT ALL ON public.trial_history TO service_role;
GRANT INSERT ON public.trial_history TO authenticated;

-- Update handle_new_user() trigger to check trial_history
-- If the email has been used for a trial before, set has_used_trial = true
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _used_trial boolean;
BEGIN
  SELECT EXISTS(SELECT 1 FROM public.trial_history WHERE email = NEW.email) INTO _used_trial;

  INSERT INTO public.profiles (id, email, full_name, is_on_trial, trial_ends_at, has_used_trial, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE WHEN _used_trial THEN false ELSE true END,
    CASE WHEN _used_trial THEN NULL ELSE NOW() + INTERVAL '14 days' END,
    _used_trial,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
