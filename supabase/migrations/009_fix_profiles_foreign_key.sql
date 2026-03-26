-- ============================================================
-- APPLIED: 2026-03-25
-- WHAT THIS DOES:
-- 1. Removes orphaned profiles (profiles with no matching auth user)
-- 2. Drops all RLS policies on profiles and 9 related tables
-- 3. Drops all foreign keys from 9 tables that reference profiles
-- 4. Converts profiles.id and all user_id columns from TEXT to UUID
-- 5. Recreates all RLS policies with UUID comparison
-- 6. Reconnects all foreign keys
-- 7. Adds the missing foreign key from profiles → auth.users with CASCADE delete
--
-- WHY: So when you delete a user from Auth, their profile auto-deletes too.
-- ============================================================

BEGIN;

DELETE FROM public.profiles
WHERE id::uuid NOT IN (SELECT id FROM auth.users);

DROP POLICY profiles_delete ON public.profiles;
DROP POLICY profiles_insert ON public.profiles;
DROP POLICY profiles_select ON public.profiles;
DROP POLICY profiles_update ON public.profiles;
DROP POLICY content_pillars_all ON public.content_pillars;
DROP POLICY content_items_all ON public.content_items;
DROP POLICY calendar_events_all ON public.calendar_events;
DROP POLICY collaborations_all ON public.collaborations;
DROP POLICY tasks_all ON public.tasks;
DROP POLICY notes_all ON public.notes;
DROP POLICY analytics_all ON public.analytics;
DROP POLICY social_accounts_all ON public.social_accounts;
DROP POLICY settings_all ON public.settings;

ALTER TABLE public.content_pillars DROP CONSTRAINT content_pillars_user_id_fkey;
ALTER TABLE public.content_items DROP CONSTRAINT content_items_user_id_fkey;
ALTER TABLE public.calendar_events DROP CONSTRAINT calendar_events_user_id_fkey;
ALTER TABLE public.collaborations DROP CONSTRAINT collaborations_user_id_fkey;
ALTER TABLE public.tasks DROP CONSTRAINT tasks_user_id_fkey;
ALTER TABLE public.notes DROP CONSTRAINT notes_user_id_fkey;
ALTER TABLE public.analytics DROP CONSTRAINT analytics_user_id_fkey;
ALTER TABLE public.social_accounts DROP CONSTRAINT social_accounts_user_id_fkey;
ALTER TABLE public.settings DROP CONSTRAINT settings_user_id_fkey;

ALTER TABLE public.profiles ALTER COLUMN id TYPE uuid USING id::uuid;
ALTER TABLE public.content_pillars ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
ALTER TABLE public.content_items ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
ALTER TABLE public.calendar_events ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
ALTER TABLE public.collaborations ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
ALTER TABLE public.tasks ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
ALTER TABLE public.notes ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
ALTER TABLE public.analytics ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
ALTER TABLE public.social_accounts ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
ALTER TABLE public.settings ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

CREATE POLICY profiles_delete ON public.profiles FOR DELETE USING (auth.uid() = id);
CREATE POLICY profiles_insert ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY profiles_select ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_update ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY content_pillars_all ON public.content_pillars FOR ALL USING (auth.uid() = user_id);
CREATE POLICY content_items_all ON public.content_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY calendar_events_all ON public.calendar_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY collaborations_all ON public.collaborations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY tasks_all ON public.tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY notes_all ON public.notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY analytics_all ON public.analytics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY social_accounts_all ON public.social_accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY settings_all ON public.settings FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.content_pillars ADD CONSTRAINT content_pillars_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.content_items ADD CONSTRAINT content_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.calendar_events ADD CONSTRAINT calendar_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.collaborations ADD CONSTRAINT collaborations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.notes ADD CONSTRAINT notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.analytics ADD CONSTRAINT analytics_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.social_accounts ADD CONSTRAINT social_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.settings ADD CONSTRAINT settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

COMMIT;
