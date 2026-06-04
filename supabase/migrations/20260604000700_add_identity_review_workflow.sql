-- Secure review workflow for confirming, splitting, or rejecting identity groups.

CREATE TABLE IF NOT EXISTS public.app_admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.coral_identity_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES public.coral_entities(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('confirmed', 'needs_split', 'rejected', 'candidate')),
  notes TEXT,
  reviewed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS coral_identity_reviews_entity_idx
  ON public.coral_identity_reviews (entity_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.is_app_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.app_admins WHERE user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.review_coral_identity(
  target_entity_id UUID,
  review_action TEXT,
  review_notes TEXT DEFAULT NULL
)
RETURNS public.coral_entities
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_entity public.coral_entities;
BEGIN
  IF NOT public.is_app_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  IF review_action NOT IN ('confirmed', 'needs_split', 'rejected', 'candidate') THEN
    RAISE EXCEPTION 'Unsupported review action';
  END IF;

  UPDATE public.coral_entities
  SET
    review_status = review_action,
    review_notes = NULLIF(TRIM(review_notes), ''),
    updated_at = NOW()
  WHERE id = target_entity_id
  RETURNING * INTO updated_entity;

  IF updated_entity.id IS NULL THEN
    RAISE EXCEPTION 'Coral identity candidate not found';
  END IF;

  INSERT INTO public.coral_identity_reviews (entity_id, action, notes, reviewed_by)
  VALUES (target_entity_id, review_action, NULLIF(TRIM(review_notes), ''), auth.uid());

  RETURN updated_entity;
END;
$$;

CREATE OR REPLACE VIEW public.coral_identity_review_summary AS
SELECT
  COUNT(*) FILTER (WHERE review_status = 'candidate')::INTEGER AS pending_groups,
  COUNT(*) FILTER (WHERE review_status = 'confirmed')::INTEGER AS confirmed_groups,
  COUNT(*) FILTER (WHERE review_status = 'needs_split')::INTEGER AS split_groups,
  COUNT(*) FILTER (WHERE review_status = 'rejected')::INTEGER AS rejected_groups
FROM public.coral_entities;

ALTER TABLE public.app_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coral_identity_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins can read own admin record" ON public.app_admins;
DROP POLICY IF EXISTS "admins can read identity reviews" ON public.coral_identity_reviews;

CREATE POLICY "admins can read own admin record" ON public.app_admins
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "admins can read identity reviews" ON public.coral_identity_reviews
  FOR SELECT USING (public.is_app_admin());

GRANT EXECUTE ON FUNCTION public.is_app_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_coral_identity(UUID, TEXT, TEXT) TO authenticated;
GRANT SELECT ON public.coral_identity_review_summary TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.review_coral_identity(UUID, TEXT, TEXT) FROM PUBLIC, anon;
