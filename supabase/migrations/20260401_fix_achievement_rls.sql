-- Fix RLS INSERT policy: users should only insert their own achievements
ALTER TABLE public.user_achievements DROP POLICY IF EXISTS "Service can insert achievements";
CREATE POLICY "Users can insert own achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);
