-- Sparse Lite measurements for a shop-readable aquarium record.
-- Individual measurement values intentionally remain nullable.

CREATE TABLE IF NOT EXISTS public.lite_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tank_id UUID NOT NULL
    REFERENCES public.lite_tank_profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  temperature_c NUMERIC(5, 2),
  salinity_sg NUMERIC(6, 4),
  kh_dkh NUMERIC(5, 2),
  no3_ppm NUMERIC(8, 3),
  po4_ppm NUMERIC(8, 4),

  note TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lite_measurements_tank_date
  ON public.lite_measurements (tank_id, measured_at DESC);

CREATE INDEX IF NOT EXISTS idx_lite_measurements_user_id
  ON public.lite_measurements (user_id);

DROP TRIGGER IF EXISTS set_lite_measurements_updated_at
  ON public.lite_measurements;

CREATE TRIGGER set_lite_measurements_updated_at
BEFORE UPDATE ON public.lite_measurements
FOR EACH ROW
EXECUTE FUNCTION public.set_lite_updated_at();

ALTER TABLE public.lite_measurements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users manage own lite measurements"
  ON public.lite_measurements;

DROP POLICY IF EXISTS "Users can manage own lite measurements"
  ON public.lite_measurements;

CREATE POLICY "Users can manage own lite measurements"
  ON public.lite_measurements
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.lite_measurements
  TO authenticated;

COMMENT ON TABLE public.lite_measurements IS
  'Sparse Lite measurements; users may record only the values measured that day.';
