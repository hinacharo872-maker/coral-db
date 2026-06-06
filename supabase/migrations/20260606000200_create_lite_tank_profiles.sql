-- Lite aquarium profile: a small, shop-readable tank summary.
-- Business fields intentionally remain nullable to allow partial records.

CREATE TABLE IF NOT EXISTS public.lite_tank_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  display_name TEXT,
  tank_volume_liters NUMERIC(8, 2),
  water_change_frequency_days INTEGER,
  water_change_volume_liters NUMERIC(8, 2),
  stage public.lite_tank_stage DEFAULT 'unknown',

  preferred_shop_id UUID,
  shop_level_flag TEXT,

  photo_url TEXT,
  note TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lite_tank_profiles_user_id
  ON public.lite_tank_profiles (user_id);

CREATE OR REPLACE FUNCTION public.set_lite_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_lite_tank_profiles_updated_at
  ON public.lite_tank_profiles;

CREATE TRIGGER set_lite_tank_profiles_updated_at
BEFORE UPDATE ON public.lite_tank_profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_lite_updated_at();

ALTER TABLE public.lite_tank_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users manage own lite tank profiles"
  ON public.lite_tank_profiles;

DROP POLICY IF EXISTS "Users can manage own lite tank profiles"
  ON public.lite_tank_profiles;

CREATE POLICY "Users can manage own lite tank profiles"
  ON public.lite_tank_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.lite_tank_profiles
  TO authenticated;

COMMENT ON TABLE public.lite_tank_profiles IS
  'Nullable Lite aquarium profile designed for a shop-readable five-second record.';

COMMENT ON COLUMN public.lite_tank_profiles.preferred_shop_id IS
  'Preferred shop identifier; foreign key will be added after the Lite shop table is defined.';

COMMENT ON COLUMN public.lite_tank_profiles.shop_level_flag IS
  'Reserved shop-facing classification; remains free text until its vocabulary is specified.';
