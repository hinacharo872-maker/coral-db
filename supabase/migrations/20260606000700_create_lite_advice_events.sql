-- Auditable Lite routing and advice events.
-- These rows describe what to check or where to route the user; they are not
-- authoritative diagnoses.

CREATE TABLE IF NOT EXISTS public.lite_advice_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tank_id UUID NOT NULL
    REFERENCES public.lite_tank_profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  recommendation_type public.lite_recommendation_type NOT NULL,
  severity public.lite_severity NOT NULL DEFAULT 'unknown',

  parameter_key TEXT,
  message TEXT NOT NULL,
  reason JSONB,
  related_additive_id UUID,
  related_shop_id UUID,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lite_advice_events_tank_date
  ON public.lite_advice_events (tank_id, created_at DESC);

ALTER TABLE public.lite_advice_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users read own lite advice events"
  ON public.lite_advice_events;

DROP POLICY IF EXISTS "users insert own lite advice events"
  ON public.lite_advice_events;

DROP POLICY IF EXISTS "Users can read own advice events"
  ON public.lite_advice_events;

DROP POLICY IF EXISTS "Users can insert own advice events"
  ON public.lite_advice_events;

CREATE POLICY "Users can read own advice events"
  ON public.lite_advice_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own advice events"
  ON public.lite_advice_events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT
  ON public.lite_advice_events
  TO authenticated;

COMMENT ON TABLE public.lite_advice_events IS
  'Append-oriented Lite recommendation history for transparent shop and user review.';

COMMENT ON COLUMN public.lite_advice_events.reason IS
  'Structured facts that produced the recommendation; must not contain hidden affiliate routing.';

COMMENT ON COLUMN public.lite_advice_events.related_additive_id IS
  'Optional additive identifier; foreign key will be added after the Lite product-master contract is finalized.';

COMMENT ON COLUMN public.lite_advice_events.related_shop_id IS
  'Optional shop identifier; foreign key will be added after the Lite shop contract is finalized.';
