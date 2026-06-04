-- Scope aquariums and water quality logs to authenticated users.

ALTER TABLE public.aquariums
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.water_quality_logs
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS aquariums_user_idx ON public.aquariums (user_id);
CREATE INDEX IF NOT EXISTS water_quality_logs_user_idx ON public.water_quality_logs (user_id, measured_at DESC);

DROP POLICY IF EXISTS "public aquarium read" ON public.aquariums;
DROP POLICY IF EXISTS "public aquarium insert" ON public.aquariums;
DROP POLICY IF EXISTS "public aquarium update" ON public.aquariums;
DROP POLICY IF EXISTS "public water log read" ON public.water_quality_logs;
DROP POLICY IF EXISTS "public water log insert" ON public.water_quality_logs;
DROP POLICY IF EXISTS "public water log delete" ON public.water_quality_logs;
DROP POLICY IF EXISTS "users manage own aquariums" ON public.aquariums;
DROP POLICY IF EXISTS "users manage own water logs" ON public.water_quality_logs;

CREATE POLICY "users manage own aquariums" ON public.aquariums
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users manage own water logs" ON public.water_quality_logs
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.aquariums aquarium
      WHERE aquarium.id = aquarium_id AND aquarium.user_id = auth.uid()
    )
  );
