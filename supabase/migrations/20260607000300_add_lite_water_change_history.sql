-- Keep the user's routine water-change settings on lite_tank_profiles while
-- preserving each actual water change as a separate nullable-friendly log.

CREATE TABLE IF NOT EXISTS public.lite_water_change_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tank_id UUID NOT NULL
    REFERENCES public.lite_tank_profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  changed_at DATE NOT NULL DEFAULT CURRENT_DATE,
  amount_liters NUMERIC(8, 2),
  note TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lite_water_change_logs_tank_date
  ON public.lite_water_change_logs (tank_id, changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_lite_water_change_logs_user_id
  ON public.lite_water_change_logs (user_id);

DROP TRIGGER IF EXISTS set_lite_water_change_logs_updated_at
  ON public.lite_water_change_logs;

CREATE TRIGGER set_lite_water_change_logs_updated_at
BEFORE UPDATE ON public.lite_water_change_logs
FOR EACH ROW
EXECUTE FUNCTION public.set_lite_updated_at();

ALTER TABLE public.lite_water_change_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own lite water changes"
  ON public.lite_water_change_logs;

CREATE POLICY "Users can manage own lite water changes"
  ON public.lite_water_change_logs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.lite_tank_profiles tank
      WHERE tank.id = lite_water_change_logs.tank_id
        AND tank.user_id = auth.uid()
    )
  );

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.lite_water_change_logs
  TO authenticated;

CREATE OR REPLACE FUNCTION public.record_lite_water_change(
  p_tank_id UUID,
  p_changed_at DATE,
  p_amount_liters NUMERIC DEFAULT NULL,
  p_note TEXT DEFAULT NULL,
  p_tank_volume_liters NUMERIC DEFAULT NULL,
  p_frequency_days INTEGER DEFAULT NULL,
  p_routine_volume_liters NUMERIC DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  UPDATE public.lite_tank_profiles
  SET tank_volume_liters = p_tank_volume_liters,
      water_change_frequency_days = p_frequency_days,
      water_change_volume_liters = p_routine_volume_liters,
      last_water_change_at = p_changed_at
  WHERE id = p_tank_id
    AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lite tank not found or not owned by current user';
  END IF;

  INSERT INTO public.lite_water_change_logs (
    tank_id,
    user_id,
    changed_at,
    amount_liters,
    note
  )
  VALUES (
    p_tank_id,
    auth.uid(),
    COALESCE(p_changed_at, CURRENT_DATE),
    p_amount_liters,
    NULLIF(BTRIM(p_note), '')
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_lite_water_change(
  UUID, DATE, NUMERIC, TEXT, NUMERIC, INTEGER, NUMERIC
) TO authenticated;

ALTER TABLE public.lite_additive_usage
  DROP CONSTRAINT IF EXISTS lite_additive_usage_additive_id_fkey;

ALTER TABLE public.lite_additive_usage
  ADD CONSTRAINT lite_additive_usage_additive_id_fkey
  FOREIGN KEY (additive_id)
  REFERENCES public.additive_products(id)
  ON DELETE SET NULL
  NOT VALID;

COMMENT ON TABLE public.lite_water_change_logs IS
  'Actual Lite water changes. Routine frequency and volume remain on lite_tank_profiles.';
