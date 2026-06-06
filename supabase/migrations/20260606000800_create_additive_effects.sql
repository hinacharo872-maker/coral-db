-- Structured effects for the commercial additive master.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'additive_parameter_key'
  ) THEN
    CREATE TYPE public.additive_parameter_key AS ENUM (
      'kh',
      'ca',
      'mg',
      'no3',
      'po4',
      'ph',
      'salinity',
      'trace',
      'bacteria',
      'other'
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'additive_effect_direction'
  ) THEN
    CREATE TYPE public.additive_effect_direction AS ENUM (
      'increase',
      'decrease',
      'stabilize',
      'supplement',
      'other'
    );
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.additive_effects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  additive_id UUID NOT NULL,

  parameter_key public.additive_parameter_key NOT NULL,
  direction public.additive_effect_direction NOT NULL,

  effect_group TEXT,
  note TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_additive_effects_additive_id
  ON public.additive_effects (additive_id);

ALTER TABLE public.additive_effects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public additive effects read"
  ON public.additive_effects;

CREATE POLICY "public additive effects read"
  ON public.additive_effects
  FOR SELECT
  USING (TRUE);

GRANT SELECT
  ON public.additive_effects
  TO anon, authenticated;

COMMENT ON TABLE public.additive_effects IS
  'Structured, publicly readable effects associated with additive products.';

COMMENT ON COLUMN public.additive_effects.additive_id IS
  'Additive product identifier kept without a foreign key to preserve independently curated effect records.';
