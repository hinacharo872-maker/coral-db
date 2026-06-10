-- ReefChart Pro v1 is an independent domain from ReefChart Lite.

DO $$
BEGIN
  CREATE TYPE public.pro_event_type AS ENUM (
    'water_change',
    'additive_started',
    'additive_stopped',
    'additive_amount_changed',
    'lighting_changed',
    'feeding_changed',
    'livestock_added',
    'coral_added',
    'maintenance',
    'trouble',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS public.pro_tank_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  tank_volume_liters NUMERIC(8, 2),
  target_ranges JSONB NOT NULL DEFAULT '{
    "kh_dkh":{"min":7.0,"max":9.0},
    "ca_ppm":{"min":400,"max":460},
    "mg_ppm":{"min":1250,"max":1400},
    "ph":{"min":7.8,"max":8.5},
    "temperature_c":{"min":24.0,"max":27.0},
    "salinity_sg":{"min":1.023,"max":1.027},
    "no3_ppm":{"min":1,"max":20},
    "po4_ppm":{"min":0.02,"max":0.12}
  }'::JSONB,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pro_tank_profiles_user_id
  ON public.pro_tank_profiles (user_id);

CREATE TABLE IF NOT EXISTS public.pro_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tank_id UUID NOT NULL REFERENCES public.pro_tank_profiles(id) ON DELETE CASCADE,
  measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  temperature_c NUMERIC(5, 2),
  salinity_sg NUMERIC(6, 4),
  ph NUMERIC(5, 2),
  kh_dkh NUMERIC(5, 2),
  ca_ppm NUMERIC(8, 2),
  mg_ppm NUMERIC(8, 2),
  no3_ppm NUMERIC(8, 3),
  po4_ppm NUMERIC(8, 4),
  nh3_nh4_ppm NUMERIC(8, 4),
  no2_ppm NUMERIC(8, 4),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT pro_measurements_has_value CHECK (
    temperature_c IS NOT NULL OR salinity_sg IS NOT NULL OR ph IS NOT NULL
    OR kh_dkh IS NOT NULL OR ca_ppm IS NOT NULL OR mg_ppm IS NOT NULL
    OR no3_ppm IS NOT NULL OR po4_ppm IS NOT NULL
    OR nh3_nh4_ppm IS NOT NULL OR no2_ppm IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_pro_measurements_tank_date
  ON public.pro_measurements (tank_id, measured_at DESC);

CREATE INDEX IF NOT EXISTS idx_pro_measurements_user_id
  ON public.pro_measurements (user_id);

CREATE TABLE IF NOT EXISTS public.pro_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tank_id UUID NOT NULL REFERENCES public.pro_tank_profiles(id) ON DELETE CASCADE,
  event_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_type public.pro_event_type NOT NULL DEFAULT 'other',
  title TEXT NOT NULL,
  description TEXT,
  additive_id UUID REFERENCES public.additive_products(id) ON DELETE SET NULL,
  amount_text TEXT,
  related_parameter TEXT CHECK (
    related_parameter IS NULL OR related_parameter IN (
      'temperature_c', 'salinity_sg', 'ph', 'kh_dkh', 'ca_ppm', 'mg_ppm',
      'no3_ppm', 'po4_ppm', 'nh3_nh4_ppm', 'no2_ppm'
    )
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pro_events_tank_date
  ON public.pro_events (tank_id, event_at DESC);

CREATE INDEX IF NOT EXISTS idx_pro_events_user_id
  ON public.pro_events (user_id);

CREATE OR REPLACE FUNCTION public.set_pro_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_pro_tank_profiles_updated_at ON public.pro_tank_profiles;
CREATE TRIGGER set_pro_tank_profiles_updated_at
BEFORE UPDATE ON public.pro_tank_profiles
FOR EACH ROW EXECUTE FUNCTION public.set_pro_updated_at();

DROP TRIGGER IF EXISTS set_pro_measurements_updated_at ON public.pro_measurements;
CREATE TRIGGER set_pro_measurements_updated_at
BEFORE UPDATE ON public.pro_measurements
FOR EACH ROW EXECUTE FUNCTION public.set_pro_updated_at();

DROP TRIGGER IF EXISTS set_pro_events_updated_at ON public.pro_events;
CREATE TRIGGER set_pro_events_updated_at
BEFORE UPDATE ON public.pro_events
FOR EACH ROW EXECUTE FUNCTION public.set_pro_updated_at();

ALTER TABLE public.pro_tank_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pro_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pro_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own Pro tank profiles" ON public.pro_tank_profiles;
CREATE POLICY "Users manage own Pro tank profiles"
  ON public.pro_tank_profiles
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own Pro measurements" ON public.pro_measurements;
CREATE POLICY "Users manage own Pro measurements"
  ON public.pro_measurements
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.pro_tank_profiles tank
      WHERE tank.id = pro_measurements.tank_id
        AND tank.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users manage own Pro events" ON public.pro_events;
CREATE POLICY "Users manage own Pro events"
  ON public.pro_events
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.pro_tank_profiles tank
      WHERE tank.id = pro_events.tank_id
        AND tank.user_id = auth.uid()
    )
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pro_tank_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pro_measurements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pro_events TO authenticated;

COMMENT ON TABLE public.pro_tank_profiles IS
  'Independent ReefChart Pro aquarium workspace. No automatic Lite synchronization.';
COMMENT ON TABLE public.pro_measurements IS
  'Sparse advanced measurements used for consumption, prediction, and trend analysis.';
COMMENT ON TABLE public.pro_events IS
  'Context events rendered alongside Pro measurement trends without claiming causation.';
