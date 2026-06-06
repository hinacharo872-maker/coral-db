-- Lite additive usage: simple owned-product and dosing context for shop advice.
-- Snapshot fields keep the record readable if the product master changes.

CREATE TABLE IF NOT EXISTS public.lite_additive_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tank_id UUID NOT NULL
    REFERENCES public.lite_tank_profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  additive_id UUID,
  product_name_snapshot TEXT,
  brand_snapshot TEXT,

  amount_text TEXT,
  frequency public.lite_additive_frequency DEFAULT 'unknown',
  usage_note TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  started_at DATE,
  stopped_at DATE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lite_additive_usage_tank_id
  ON public.lite_additive_usage (tank_id);

DROP TRIGGER IF EXISTS set_lite_additive_usage_updated_at
  ON public.lite_additive_usage;

CREATE TRIGGER set_lite_additive_usage_updated_at
BEFORE UPDATE ON public.lite_additive_usage
FOR EACH ROW
EXECUTE FUNCTION public.set_lite_updated_at();

ALTER TABLE public.lite_additive_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users manage own lite additive usage"
  ON public.lite_additive_usage;

DROP POLICY IF EXISTS "Users can manage own lite additive usage"
  ON public.lite_additive_usage;

CREATE POLICY "Users can manage own lite additive usage"
  ON public.lite_additive_usage
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.lite_additive_usage
  TO authenticated;

COMMENT ON TABLE public.lite_additive_usage IS
  'Simple Lite additive usage context used to prefer owned products before purchase recommendations.';

COMMENT ON COLUMN public.lite_additive_usage.additive_id IS
  'Optional product-master identifier; foreign key will be added when the Lite master contract is finalized.';
