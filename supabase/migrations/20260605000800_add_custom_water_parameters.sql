-- Allow users to extend water-quality logging with custom parameters.

ALTER TABLE public.water_quality_logs
  ADD COLUMN IF NOT EXISTS custom_values JSONB NOT NULL DEFAULT '{}'::JSONB;

CREATE TABLE IF NOT EXISTS public.water_parameters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  unit TEXT,
  step NUMERIC(10, 4) NOT NULL DEFAULT 1,
  min_value NUMERIC(12, 4),
  max_value NUMERIC(12, 4),
  default_value NUMERIC(12, 4),
  display_order INTEGER NOT NULL DEFAULT 100,
  is_builtin BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (
    key ~ '^[a-z][a-z0-9_]*$'
    AND step > 0
    AND (min_value IS NULL OR max_value IS NULL OR min_value <= max_value)
    AND (
      (is_builtin = true AND user_id IS NULL)
      OR (is_builtin = false AND user_id IS NOT NULL)
    )
  ),
  UNIQUE (user_id, key)
);

CREATE UNIQUE INDEX IF NOT EXISTS water_parameters_builtin_key_idx
  ON public.water_parameters (key)
  WHERE user_id IS NULL;

CREATE INDEX IF NOT EXISTS water_parameters_user_order_idx
  ON public.water_parameters (user_id, is_active, display_order);

INSERT INTO public.water_parameters (
  user_id,
  key,
  label,
  unit,
  step,
  min_value,
  max_value,
  default_value,
  display_order,
  is_builtin,
  is_active
)
VALUES
  (NULL, 'temperature', '水温', '°C', 0.1, 20, 30, 25.0, 10, true, true),
  (NULL, 'salinity', '比重', NULL, 0.001, 1.018, 1.030, 1.025, 20, true, true),
  (NULL, 'ph', 'pH', NULL, 0.1, 7.6, 8.6, 8.2, 30, true, true),
  (NULL, 'kh', 'KH', 'dKH', 0.1, 5, 12, 8.0, 40, true, true),
  (NULL, 'calcium', 'Ca', 'ppm', 5, 350, 500, 430, 50, true, true),
  (NULL, 'magnesium', 'Mg', 'ppm', 10, 1100, 1600, 1320, 60, true, true),
  (NULL, 'nitrate', 'NO3', 'ppm', 0.1, 0, 50, 2.0, 70, true, true),
  (NULL, 'phosphate', 'PO4', 'ppm', 0.01, 0, 1, 0.04, 80, true, true),
  (NULL, 'potassium', 'K', 'ppm', 5, 300, 450, 400, 90, true, false),
  (NULL, 'iodine', 'Iodine', 'ppm', 0.01, 0, 0.12, 0.06, 100, true, false),
  (NULL, 'strontium', 'Sr', 'ppm', 1, 0, 15, 8, 110, true, false),
  (NULL, 'iron', 'Fe', 'ppm', 0.001, 0, 0.1, 0.01, 120, true, false)
ON CONFLICT (key) WHERE user_id IS NULL DO UPDATE SET
  label = EXCLUDED.label,
  unit = EXCLUDED.unit,
  step = EXCLUDED.step,
  min_value = EXCLUDED.min_value,
  max_value = EXCLUDED.max_value,
  default_value = EXCLUDED.default_value,
  display_order = EXCLUDED.display_order,
  is_builtin = true,
  updated_at = NOW();

ALTER TABLE public.water_parameters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public builtin water parameters read" ON public.water_parameters;
DROP POLICY IF EXISTS "users manage own water parameters" ON public.water_parameters;

CREATE POLICY "public builtin water parameters read" ON public.water_parameters
  FOR SELECT
  USING (is_builtin = true AND user_id IS NULL);

CREATE POLICY "users manage own water parameters" ON public.water_parameters
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND is_builtin = false);

GRANT SELECT ON public.water_parameters TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.water_parameters TO authenticated;
