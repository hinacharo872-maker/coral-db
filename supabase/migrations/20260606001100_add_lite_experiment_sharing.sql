-- Lite experiment: secure shop record sharing, view tracking, feedback, and
-- admin-only aggregate reporting. No diagnosis or dosing calculation lives
-- in this layer.

ALTER TABLE public.lite_tank_profiles
  ADD COLUMN IF NOT EXISTS source_aquarium_id UUID
    REFERENCES public.aquariums(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_lite_tank_profiles_source_aquarium
  ON public.lite_tank_profiles (source_aquarium_id)
  WHERE source_aquarium_id IS NOT NULL;

DROP POLICY IF EXISTS "Users can manage own share links"
  ON public.lite_shop_share_links;

CREATE POLICY "Users can manage own share links"
  ON public.lite_shop_share_links
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.lite_tank_profiles tank
      WHERE tank.id = tank_id
        AND tank.user_id = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS public.lite_share_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_link_id UUID NOT NULL
    REFERENCES public.lite_shop_share_links(id) ON DELETE CASCADE,
  visitor_key TEXT,
  viewed_on DATE NOT NULL DEFAULT CURRENT_DATE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lite_share_views_link_date
  ON public.lite_share_views (share_link_id, viewed_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_lite_share_views_daily_visitor
  ON public.lite_share_views (share_link_id, visitor_key, viewed_on)
  WHERE visitor_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.shop_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_link_id UUID NOT NULL
    REFERENCES public.lite_shop_share_links(id) ON DELETE CASCADE,
  rating TEXT NOT NULL
    CHECK (rating IN ('sufficient', 'mostly_sufficient', 'insufficient')),
  missing_info TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shop_feedback_share_link_date
  ON public.shop_feedback (share_link_id, created_at DESC);

ALTER TABLE public.lite_share_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_feedback ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.lite_share_views FROM anon, authenticated;
REVOKE ALL ON public.shop_feedback FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.create_lite_profile_from_aquarium(
  p_aquarium_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_aquarium public.aquariums%ROWTYPE;
  v_tank_id UUID;
BEGIN
  SELECT *
    INTO v_aquarium
  FROM public.aquariums
  WHERE id = p_aquarium_id
    AND user_id = auth.uid()
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Aquarium not found';
  END IF;

  SELECT id
    INTO v_tank_id
  FROM public.lite_tank_profiles
  WHERE source_aquarium_id = p_aquarium_id
    AND user_id = auth.uid()
  LIMIT 1;

  IF v_tank_id IS NOT NULL THEN
    RETURN v_tank_id;
  END IF;

  INSERT INTO public.lite_tank_profiles (
    user_id,
    source_aquarium_id,
    display_name,
    tank_volume_liters,
    note
  )
  VALUES (
    auth.uid(),
    v_aquarium.id,
    v_aquarium.name,
    v_aquarium.volume_liters,
    v_aquarium.notes
  )
  RETURNING id INTO v_tank_id;

  INSERT INTO public.lite_measurements (
    tank_id,
    user_id,
    measured_at,
    temperature_c,
    salinity_sg,
    kh_dkh,
    no3_ppm,
    po4_ppm,
    note
  )
  SELECT
    v_tank_id,
    auth.uid(),
    log.measured_at::TIMESTAMPTZ,
    log.temperature,
    log.salinity,
    log.kh,
    log.nitrate,
    log.phosphate,
    log.notes
  FROM public.water_quality_logs log
  WHERE log.aquarium_id = p_aquarium_id
    AND log.user_id = auth.uid()
    AND log.measured_at >= CURRENT_DATE - 30
  ORDER BY log.measured_at;

  RETURN v_tank_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_lite_shared_record(
  p_token TEXT,
  p_visitor_key TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_link public.lite_shop_share_links%ROWTYPE;
  v_payload JSONB;
BEGIN
  SELECT *
    INTO v_link
  FROM public.lite_shop_share_links
  WHERE token = p_token
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'not_found');
  END IF;

  IF v_link.status = 'revoked' THEN
    RETURN jsonb_build_object('status', 'revoked');
  END IF;

  IF v_link.status = 'expired'
     OR (v_link.expires_at IS NOT NULL AND v_link.expires_at <= NOW()) THEN
    UPDATE public.lite_shop_share_links
      SET status = 'expired'
    WHERE id = v_link.id
      AND status <> 'expired';

    RETURN jsonb_build_object(
      'status', 'expired',
      'expires_at', v_link.expires_at
    );
  END IF;

  UPDATE public.lite_shop_share_links
    SET last_accessed_at = NOW()
  WHERE id = v_link.id;

  INSERT INTO public.lite_share_views (
    share_link_id,
    visitor_key
  )
  VALUES (
    v_link.id,
    NULLIF(LEFT(p_visitor_key, 160), '')
  )
  ON CONFLICT DO NOTHING;

  SELECT jsonb_build_object(
    'status', 'active',
    'share_link_id', v_link.id,
    'expires_at', v_link.expires_at,
    'tank', (
      SELECT jsonb_build_object(
        'display_name', tank.display_name,
        'tank_volume_liters', tank.tank_volume_liters,
        'stage', tank.stage,
        'photo_url', tank.photo_url,
        'note', tank.note
      )
      FROM public.lite_tank_profiles tank
      WHERE tank.id = v_link.tank_id
    ),
    'latest_photo', (
      SELECT jsonb_build_object(
        'photo_url', photo.photo_url,
        'taken_at', photo.taken_at,
        'note', photo.note
      )
      FROM public.lite_tank_photos photo
      WHERE photo.tank_id = v_link.tank_id
      ORDER BY photo.taken_at DESC
      LIMIT 1
    ),
    'latest_measurement', (
      SELECT to_jsonb(measurement) - 'user_id' - 'tank_id'
      FROM public.lite_measurements measurement
      WHERE measurement.tank_id = v_link.tank_id
      ORDER BY measurement.measured_at DESC
      LIMIT 1
    ),
    'measurements', COALESCE((
      SELECT jsonb_agg(
        to_jsonb(measurement) - 'user_id' - 'tank_id'
        ORDER BY measurement.measured_at ASC
      )
      FROM public.lite_measurements measurement
      WHERE measurement.tank_id = v_link.tank_id
        AND measurement.measured_at >= NOW() - INTERVAL '30 days'
    ), '[]'::JSONB),
    'additives', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'product_name', additive.product_name_snapshot,
          'brand', additive.brand_snapshot,
          'amount', additive.amount_text,
          'frequency', additive.frequency,
          'note', additive.usage_note
        )
        ORDER BY additive.brand_snapshot, additive.product_name_snapshot
      )
      FROM public.lite_additive_usage additive
      WHERE additive.tank_id = v_link.tank_id
        AND additive.is_active = TRUE
    ), '[]'::JSONB)
  )
  INTO v_payload;

  RETURN v_payload;
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_shop_feedback(
  p_token TEXT,
  p_rating TEXT,
  p_missing_info TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_link public.lite_shop_share_links%ROWTYPE;
  v_feedback_id UUID;
BEGIN
  IF p_rating NOT IN ('sufficient', 'mostly_sufficient', 'insufficient') THEN
    RAISE EXCEPTION 'Invalid feedback rating';
  END IF;

  SELECT *
    INTO v_link
  FROM public.lite_shop_share_links
  WHERE token = p_token
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > NOW())
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Share link is not active';
  END IF;

  INSERT INTO public.shop_feedback (
    share_link_id,
    rating,
    missing_info
  )
  VALUES (
    v_link.id,
    p_rating,
    NULLIF(LEFT(BTRIM(p_missing_info), 1000), '')
  )
  RETURNING id INTO v_feedback_id;

  RETURN v_feedback_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_lite_experiment_metrics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_app_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  RETURN jsonb_build_object(
    'share_count', (
      SELECT COUNT(*) FROM public.lite_shop_share_links
    ),
    'active_share_count', (
      SELECT COUNT(*)
      FROM public.lite_shop_share_links
      WHERE status = 'active'
        AND (expires_at IS NULL OR expires_at > NOW())
    ),
    'view_count', (
      SELECT COUNT(*) FROM public.lite_share_views
    ),
    'feedback_count', (
      SELECT COUNT(*) FROM public.shop_feedback
    ),
    'ratings', COALESCE((
      SELECT jsonb_object_agg(rating, rating_count)
      FROM (
        SELECT rating, COUNT(*) AS rating_count
        FROM public.shop_feedback
        GROUP BY rating
      ) rating_totals
    ), '{}'::JSONB),
    'common_missing_info', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'text', missing_info,
          'count', missing_count
        )
        ORDER BY missing_count DESC, missing_info
      )
      FROM (
        SELECT missing_info, COUNT(*) AS missing_count
        FROM public.shop_feedback
        WHERE rating = 'insufficient'
          AND missing_info IS NOT NULL
        GROUP BY missing_info
        ORDER BY missing_count DESC
        LIMIT 20
      ) missing_totals
    ), '[]'::JSONB)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_lite_shared_record(TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_shop_feedback(TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_lite_experiment_metrics() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_lite_profile_from_aquarium(UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_lite_shared_record(TEXT, TEXT)
  TO anon, authenticated;

GRANT EXECUTE ON FUNCTION public.submit_shop_feedback(TEXT, TEXT, TEXT)
  TO anon, authenticated;

GRANT EXECUTE ON FUNCTION public.get_lite_experiment_metrics()
  TO authenticated;

GRANT EXECUTE ON FUNCTION public.create_lite_profile_from_aquarium(UUID)
  TO authenticated;

COMMENT ON TABLE public.lite_share_views IS
  'Deduplicated daily shop-view events for the Lite sharing experiment.';

COMMENT ON TABLE public.shop_feedback IS
  'Shop feedback on whether the shared Lite record contained enough information.';
