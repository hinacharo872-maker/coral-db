-- Optional shop-facing husbandry context. Existing Lite profiles remain valid.

ALTER TABLE public.lite_tank_profiles
  ADD COLUMN IF NOT EXISTS ph NUMERIC(4, 2),
  ADD COLUMN IF NOT EXISTS salt_mix_name TEXT,
  ADD COLUMN IF NOT EXISTS lighting_equipment JSONB,
  ADD COLUMN IF NOT EXISTS wave_pumps JSONB,
  ADD COLUMN IF NOT EXISTS filtration_method TEXT;

ALTER TABLE public.lite_tank_profiles
  DROP CONSTRAINT IF EXISTS lite_tank_profiles_ph_check;

ALTER TABLE public.lite_tank_profiles
  ADD CONSTRAINT lite_tank_profiles_ph_check
  CHECK (ph IS NULL OR (ph >= 0 AND ph <= 14));

ALTER TABLE public.lite_tank_profiles
  DROP CONSTRAINT IF EXISTS lite_tank_profiles_lighting_equipment_check;

ALTER TABLE public.lite_tank_profiles
  ADD CONSTRAINT lite_tank_profiles_lighting_equipment_check
  CHECK (lighting_equipment IS NULL OR jsonb_typeof(lighting_equipment) = 'array');

ALTER TABLE public.lite_tank_profiles
  DROP CONSTRAINT IF EXISTS lite_tank_profiles_wave_pumps_check;

ALTER TABLE public.lite_tank_profiles
  ADD CONSTRAINT lite_tank_profiles_wave_pumps_check
  CHECK (wave_pumps IS NULL OR jsonb_typeof(wave_pumps) = 'array');

COMMENT ON COLUMN public.lite_tank_profiles.ph IS
  'Optional home-tank pH snapshot supplied for shop consultation; not part of the required Lite measurement flow.';
COMMENT ON COLUMN public.lite_tank_profiles.salt_mix_name IS
  'Optional salt mix product name, including user-entered products.';
COMMENT ON COLUMN public.lite_tank_profiles.lighting_equipment IS
  'Optional array of {name, quantity} lighting entries.';
COMMENT ON COLUMN public.lite_tank_profiles.wave_pumps IS
  'Optional array of {name, quantity} wave-pump entries.';
COMMENT ON COLUMN public.lite_tank_profiles.filtration_method IS
  'Optional filtration method shown to a consulting shop.';

-- Shared records keep their existing RPC. This companion only exposes optional
-- environment fields for an active, unexpired token.
CREATE OR REPLACE FUNCTION public.get_lite_shared_environment(p_token TEXT)
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT jsonb_strip_nulls(jsonb_build_object(
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
