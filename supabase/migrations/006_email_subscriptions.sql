-- Email subscriptions table for landing page "Stay in the Loop" form
CREATE TABLE IF NOT EXISTS public.email_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  subscribed_at timestamptz DEFAULT now()
);

ALTER TABLE public.email_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.email_subscriptions;
CREATE POLICY "Allow anonymous inserts"
  ON public.email_subscriptions
  FOR INSERT
  WITH CHECK (true);

GRANT INSERT ON public.email_subscriptions TO anon;
