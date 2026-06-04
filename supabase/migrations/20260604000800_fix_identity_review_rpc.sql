-- Avoid ambiguity between RPC argument names and coral_entities column names.

DROP FUNCTION IF EXISTS public.review_coral_identity(UUID, TEXT, TEXT);

CREATE FUNCTION public.review_coral_identity(
  p_entity_id UUID,
  p_action TEXT,
  p_notes TEXT DEFAULT NULL
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

  IF p_action NOT IN ('confirmed', 'needs_split', 'rejected', 'candidate') THEN
    RAISE EXCEPTION 'Unsupported review action';
  END IF;

  UPDATE public.coral_entities AS entity
  SET
    review_status = p_action,
    review_notes = NULLIF(TRIM(p_notes), ''),
    updated_at = NOW()
  WHERE entity.id = p_entity_id
  RETURNING entity.* INTO updated_entity;

  IF updated_entity.id IS NULL THEN
    RAISE EXCEPTION 'Coral identity candidate not found';
  END IF;

  INSERT INTO public.coral_identity_reviews (entity_id, action, notes, reviewed_by)
  VALUES (p_entity_id, p_action, NULLIF(TRIM(p_notes), ''), auth.uid());

  RETURN updated_entity;
END;
$$;

GRANT EXECUTE ON FUNCTION public.review_coral_identity(UUID, TEXT, TEXT) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.review_coral_identity(UUID, TEXT, TEXT) FROM PUBLIC, anon;
