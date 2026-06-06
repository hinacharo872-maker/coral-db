-- Lite tank photo history for quick visual review by the user and shop.

CREATE TABLE IF NOT EXISTS public.lite_tank_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tank_id UUID NOT NULL
    REFERENCES public.lite_tank_profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  photo_url TEXT NOT NULL,
  taken_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lite_tank_photos_tank_date
  ON public.lite_tank_photos (tank_id, taken_at DESC);

ALTER TABLE public.lite_tank_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users manage own lite tank photos"
  ON public.lite_tank_photos;

DROP POLICY IF EXISTS "Users can manage own lite photos"
  ON public.lite_tank_photos;

CREATE POLICY "Users can manage own lite photos"
  ON public.lite_tank_photos
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.lite_tank_photos
  TO authenticated;

COMMENT ON TABLE public.lite_tank_photos IS
  'Chronological Lite tank photos used for fast visual review and shop consultation.';
