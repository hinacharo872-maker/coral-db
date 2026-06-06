-- Official additive dosing and usage guidance.
-- Numeric strength fields support transparent calculations but must not be
-- treated as an automatic dosing instruction without user or shop review.

CREATE TABLE IF NOT EXISTS public.additive_dosing_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  additive_id UUID NOT NULL,

  official_dose_text TEXT,
  official_usage_text TEXT,

  strength_amount_ml NUMERIC(10, 3),
  strength_tank_volume_liters NUMERIC(10, 3),
  strength_change_amount NUMERIC(10, 4),
  strength_change_unit TEXT,

  max_daily_dose_text TEXT,
  caution_text TEXT,

  source_title TEXT,
  source_url TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_additive_dosing_guides_additive_id
  ON public.additive_dosing_guides (additive_id);

DROP TRIGGER IF EXISTS set_additive_dosing_guides_updated_at
  ON public.additive_dosing_guides;

CREATE TRIGGER set_additive_dosing_guides_updated_at
BEFORE UPDATE ON public.additive_dosing_guides
FOR EACH ROW
EXECUTE FUNCTION public.set_lite_updated_at();

ALTER TABLE public.additive_dosing_guides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public additive dosing guides read"
  ON public.additive_dosing_guides;

CREATE POLICY "public additive dosing guides read"
  ON public.additive_dosing_guides
  FOR SELECT
  USING (TRUE);

GRANT SELECT
  ON public.additive_dosing_guides
  TO anon, authenticated;

COMMENT ON TABLE public.additive_dosing_guides IS
  'Publicly readable official additive guidance and source attribution.';

COMMENT ON COLUMN public.additive_dosing_guides.additive_id IS
  'Additive product identifier kept without a foreign key to preserve independently curated guidance.';

COMMENT ON COLUMN public.additive_dosing_guides.strength_change_amount IS
  'Manufacturer-derived change amount for the stated dose and tank volume; not an automatic dosing recommendation.';
