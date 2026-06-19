-- Optional tank dimensions for the Lite shop record. Existing profiles remain valid.

ALTER TABLE public.lite_tank_profiles
  ADD COLUMN IF NOT EXISTS tank_width_cm NUMERIC(8, 2),
  ADD COLUMN IF NOT EXISTS tank_depth_cm NUMERIC(8, 2),
  ADD COLUMN IF NOT EXISTS tank_height_cm NUMERIC(8, 2);

ALTER TABLE public.lite_tank_profiles
  DROP CONSTRAINT IF EXISTS lite_tank_profiles_width_check,
  DROP CONSTRAINT IF EXISTS lite_tank_profiles_depth_check,
  DROP CONSTRAINT IF EXISTS lite_tank_profiles_height_check;

ALTER TABLE public.lite_tank_profiles
  ADD CONSTRAINT lite_tank_profiles_width_check
    CHECK (tank_width_cm IS NULL OR tank_width_cm > 0),
  ADD CONSTRAINT lite_tank_profiles_depth_check
    CHECK (tank_depth_cm IS NULL OR tank_depth_cm > 0),
  ADD CONSTRAINT lite_tank_profiles_height_check
    CHECK (tank_height_cm IS NULL OR tank_height_cm > 0);

COMMENT ON COLUMN public.lite_tank_profiles.tank_width_cm IS
  'Optional display-tank width in centimeters for shop consultation.';
COMMENT ON COLUMN public.lite_tank_profiles.tank_depth_cm IS
  'Optional display-tank depth in centimeters for shop consultation.';
COMMENT ON COLUMN public.lite_tank_profiles.tank_height_cm IS
  'Optional display-tank height in centimeters for shop consultation.';

CREATE OR REPLACE FUNCTION public.get_lite_shared_environment(p_token TEXT)
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT jsonb_strip_nulls(jsonb_build_object(
    'tank_width_cm', tank.tank_width_cm,
    'tank_depth_cm', tank.tank_depth_cm,
    'tank_height_cm', tank.tank_height_cm,
    'tank_volume_liters', tank.tank_volume_liters,
    'ph', tank.ph,
    'salt_mix_name', tank.salt_mix_name,
    'lighting_equipment', tank.lighting_equipment,
    'wave_pumps', tank.wave_pumps,
    'filtration_method', tank.filtration_method
  ))
  FROM public.lite_shop_share_links link
  JOIN public.lite_tank_profiles tank ON tank.id = link.tank_id
  WHERE link.token = p_token
    AND link.status = 'active'
    AND (link.expires_at IS NULL OR link.expires_at > NOW())
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_lite_shared_environment(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_lite_shared_environment(TEXT) TO anon, authenticated;
