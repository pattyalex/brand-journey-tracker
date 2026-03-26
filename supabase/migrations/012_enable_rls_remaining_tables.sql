-- =====================================================
-- Migration 012: Enable RLS on user_strategy and user_goals
-- user_id is UUID type, auth.uid() returns UUID
-- =====================================================

-- 1. USER_STRATEGY
ALTER TABLE public.user_strategy ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own strategy" ON public.user_strategy FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own strategy" ON public.user_strategy FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own strategy" ON public.user_strategy FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own strategy" ON public.user_strategy FOR DELETE USING (user_id = auth.uid());

-- 2. USER_GOALS
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own goals" ON public.user_goals FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own goals" ON public.user_goals FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own goals" ON public.user_goals FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own goals" ON public.user_goals FOR DELETE USING (user_id = auth.uid());
