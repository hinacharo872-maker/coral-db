-- Improve the Lite experiment with per-parameter freshness, water-change
-- context, and structured shop feedback suitable for quantitative analysis.

ALTER TABLE public.lite_tank_profiles
  ADD COLUMN IF NOT EXISTS last_water_change_at DATE;

ALTER TABLE public.shop_feedback
  ADD COLUMN IF NOT EXISTS missing_keys TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE public.shop_feedback
  DROP CONSTRAINT IF EXISTS shop_feedback_missing_keys_check;

ALTER TABLE public.shop_feedback
  ADD CONSTRAINT shop_feedback_missing_keys_check
  CHECK (
    missing_keys <@ ARRAY[
      'kh_dkh',
      'temperature_c',
      'salinity_sg',
      'no3_ppm',
      'po4_ppm',
      'tank_volume',
      'water_change_frequency',
      'water_change_volume',
      'additives',
      'photo',
      'other'
    ]::TEXT[]
  );

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

  INSERT INTO public.lite_share_views (share_link_id, visitor_key)
  VALUES (v_link.id, NULLIF(LEFT(p_visitor_key, 160), ''))
  ON CONFLICT DO NOTHING;

  SELECT jsonb_build_object(
    'status', 'active',
    'share_link_id', v_link.id,
    'expires_at', v_link.expires_at,
    'tank', (
      SELECT jsonb_build_object(
        'display_name', tank.display_name,
        'tank_volume_liters', tank.tank_volume_liters,
        'water_change_frequency_days', COALESCE(
          tank.water_change_frequency_days,
          (
            SELECT (MAX(recent.changed_at) - MIN(recent.changed_at))::INTEGER
            FROM (
              SELECT change.changed_at
              FROM public.water_change_logs change
              WHERE change.aquarium_id = tank.source_aquarium_id
              ORDER BY change.changed_at DESC
              LIMIT 2
            ) recent
            HAVING COUNT(*) = 2
          )
        ),
        'water_change_volume_liters', COALESCE(
          tank.water_change_volume_liters,
          (
            SELECT change.amount_liters
            FROM public.water_change_logs change
            WHERE change.aquarium_id = tank.source_aquarium_id
            ORDER BY change.changed_at DESC
            LIMIT 1
          )
        ),
        'last_water_change_at', COALESCE(
          tank.last_water_change_at,
          (
            SELECT change.changed_at
            FROM public.water_change_logs change
            WHERE change.aquarium_id = tank.source_aquarium_id
            ORDER BY change.changed_at DESC
            LIMIT 1
          )
        ),
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
    'parameter_latest', jsonb_build_object(
      'kh_dkh', (
        SELECT jsonb_build_object('value', measurement.kh_dkh, 'measured_at', measurement.measured_at)
        FROM public.lite_measurements measurement
        WHERE measurement.tank_id = v_link.tank_id
          AND measurement.kh_dkh IS NOT NULL
        ORDER BY measurement.measured_at DESC
        LIMIT 1
      ),
      'temperature_c', (
        SELECT jsonb_build_object('value', measurement.temperature_c, 'measured_at', measurement.measured_at)
        FROM public.lite_measurements measurement
        WHERE measurement.tank_id = v_link.tank_id
          AND measurement.temperature_c IS NOT NULL
        ORDER BY measurement.measured_at DESC
        LIMIT 1
      ),
      'salinity_sg', (
        SELECT jsonb_build_object('value', measurement.salinity_sg, 'measured_at', measurement.measured_at)
        FROM public.lite_measurements measurement
        WHERE measurement.tank_id = v_link.tank_id
          AND measurement.salinity_sg IS NOT NULL
        ORDER BY measurement.measured_at DESC
        LIMIT 1
      ),
      'no3_ppm', (
        SELECT jsonb_build_object('value', measurement.no3_ppm, 'measured_at', measurement.measured_at)
        FROM public.lite_measurements measurement
        WHERE measurement.tank_id = v_link.tank_id
          AND measurement.no3_ppm IS NOT NULL
        ORDER BY measurement.measured_at DESC
        LIMIT 1
      ),
      'po4_ppm', (
        SELECT jsonb_build_object('value', measurement.po4_ppm, 'measured_at', measurement.measured_at)
        FROM public.lite_measurements measurement
        WHERE measurement.tank_id = v_link.tank_id
          AND measurement.po4_ppm IS NOT NULL
        ORDER BY measurement.measured_at DESC
        LIMIT 1
      )
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

DROP FUNCTION IF EXISTS public.submit_shop_feedback(TEXT, TEXT, TEXT);

CREATE FUNCTION public.submit_shop_feedback(
  p_token TEXT,
  p_rating TEXT,
  p_missing_info TEXT DEFAULT NULL,
  p_missing_keys TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_link public.lite_shop_share_links%ROWTYPE;
  v_feedback_id UUID;
  v_allowed_keys CONSTANT TEXT[] := ARRAY[
    'kh_dkh',
    'temperature_c',
    'salinity_sg',
    'no3_ppm',
    'po4_ppm',
    'tank_volume',
    'water_change_frequency',
    'water_change_volume',
    'additives',
    'photo',
    'other'
  ]::TEXT[];
BEGIN
  IF p_rating NOT IN ('sufficient', 'mostly_sufficient', 'insufficient') THEN
    RAISE EXCEPTION 'Invalid feedback rating';
  END IF;

  IF p_rating = 'insufficient'
     AND COALESCE(array_length(p_missing_keys, 1), 0) = 0 THEN
    RAISE EXCEPTION 'Select at least one missing item';
  END IF;

  IF NOT COALESCE(p_missing_keys, ARRAY[]::TEXT[]) <@ v_allowed_keys THEN
    RAISE EXCEPTION 'Invalid missing item';
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
    missing_info,
    missing_keys
  )
  VALUES (
    v_link.id,
    p_rating,
    NULLIF(LEFT(BTRIM(p_missing_info), 1000), ''),
    CASE
      WHEN p_rating = 'insufficient' THEN COALESCE(p_missing_keys, ARRAY[]::TEXT[])
      ELSE ARRAY[]::TEXT[]
    END
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
    'share_count', (SELECT COUNT(*) FROM public.lite_shop_share_links),
    'active_share_count', (
      SELECT COUNT(*)
      FROM public.lite_shop_share_links
      WHERE status = 'active'
        AND (expires_at IS NULL OR expires_at > NOW())
    ),
    'view_count', (SELECT COUNT(*) FROM public.lite_share_views),
    'feedback_count', (SELECT COUNT(*) FROM public.shop_feedback),
    'ratings', COALESCE((
      SELECT jsonb_object_agg(rating, rating_count)
      FROM (
        SELECT rating, COUNT(*) AS rating_count
        FROM public.shop_feedback
        GROUP BY rating
      ) rating_totals
    ), '{}'::JSONB),
    'missing_key_ranking', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object('key', missing_key, 'count', missing_count)
        ORDER BY missing_count DESC, missing_key
      )
      FROM (
        SELECT missing_key, COUNT(*) AS missing_count
        FROM public.shop_feedback feedback,
          LATERAL unnest(feedback.missing_keys) AS missing_key
        WHERE feedback.rating = 'insufficient'
        GROUP BY missing_key
      ) missing_totals
    ), '[]'::JSONB),
    'common_missing_info', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object('text', missing_info, 'count', missing_count)
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
      ) missing_text_totals
    ), '[]'::JSONB)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.submit_shop_feedback(TEXT, TEXT, TEXT, TEXT[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_shop_feedback(TEXT, TEXT, TEXT, TEXT[])
  TO anon, authenticated;

COMMENT ON COLUMN public.shop_feedback.missing_keys IS
  'Structured multi-select reasons describing what the shop needed but could not find.';
