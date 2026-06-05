-- Water-quality analysis settings and aquarium event logs.

ALTER TABLE public.aquariums
  ADD COLUMN IF NOT EXISTS target_preset TEXT NOT NULL DEFAULT 'sps'
    CHECK (target_preset IN ('sps', 'lps', 'soft', 'fish', 'custom')),
  ADD COLUMN IF NOT EXISTS custom_targets JSONB NOT NULL DEFAULT '{}'::JSONB;

CREATE TABLE IF NOT EXISTS public.aquarium_event_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  aquarium_id UUID NOT NULL REFERENCES public.aquariums(id) ON DELETE CASCADE,
  event_at DATE NOT NULL DEFAULT CURRENT_DATE,
  event_type TEXT NOT NULL
    CHECK (event_type IN ('dosing', 'water_change', 'feeding_change', 'lighting_change', 'livestock_added', 'maintenance', 'other')),
  title TEXT NOT NULL,
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS aquarium_event_logs_user_date_idx
  ON public.aquarium_event_logs (user_id, event_at DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS aquarium_event_logs_aquarium_date_idx
  ON public.aquarium_event_logs (aquarium_id, event_at DESC, created_at DESC);

ALTER TABLE public.aquarium_event_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users manage own aquarium events" ON public.aquarium_event_logs;

CREATE POLICY "users manage own aquarium events" ON public.aquarium_event_logs
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.aquariums aquarium
      WHERE aquarium.id = aquarium_event_logs.aquarium_id
        AND aquarium.user_id = auth.uid()
    )
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.aquarium_event_logs TO authenticated;
