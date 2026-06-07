-- Prevent new all-empty Lite measurement rows while preserving any historical
-- rows that may already exist.

ALTER TABLE public.lite_measurements
  DROP CONSTRAINT IF EXISTS lite_measurements_has_value;

ALTER TABLE public.lite_measurements
  ADD CONSTRAINT lite_measurements_has_value
  CHECK (
    temperature_c IS NOT NULL
    OR salinity_sg IS NOT NULL
    OR kh_dkh IS NOT NULL
    OR no3_ppm IS NOT NULL
    OR po4_ppm IS NOT NULL
  )
  NOT VALID;

COMMENT ON CONSTRAINT lite_measurements_has_value
  ON public.lite_measurements IS
  'New Lite measurement rows must contain at least one measured parameter.';
