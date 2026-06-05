-- Wiki-style coral contributions and water-parameter matching.

ALTER TABLE public.coral_entities
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending_review'
    CHECK (status IN ('draft', 'pending_review', 'approved'));

UPDATE public.coral_entities
SET status = CASE
  WHEN review_status = 'rejected' THEN 'draft'
  ELSE 'approved'
END
WHERE status <> CASE
  WHEN review_status = 'rejected' THEN 'draft'
  ELSE 'approved'
END;

CREATE TABLE IF NOT EXISTS public.coral_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coral_entity_id UUID NOT NULL REFERENCES public.coral_entities(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL
    CHECK (source_type IN ('paper', 'forum', 'expert_blog', 'book', 'public_database', 'shop_listing', 'other')),
  title TEXT NOT NULL,
  url TEXT,
  citation TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('draft', 'approved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS coral_references_entity_idx
  ON public.coral_references (coral_entity_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS public.coral_care_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coral_entity_id UUID NOT NULL UNIQUE REFERENCES public.coral_entities(id) ON DELETE CASCADE,
  temperature_min NUMERIC,
  temperature_max NUMERIC,
  salinity_min NUMERIC,
  salinity_max NUMERIC,
  ph_min NUMERIC,
  ph_max NUMERIC,
  kh_min NUMERIC,
  kh_max NUMERIC,
  calcium_min NUMERIC,
  calcium_max NUMERIC,
  magnesium_min NUMERIC,
  magnesium_max NUMERIC,
  nitrate_min NUMERIC,
  nitrate_max NUMERIC,
  phosphate_min NUMERIC,
  phosphate_max NUMERIC,
  confidence TEXT NOT NULL DEFAULT 'low' CHECK (confidence IN ('high', 'medium', 'low')),
  source_note TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (temperature_min IS NULL OR temperature_max IS NULL OR temperature_min <= temperature_max),
  CHECK (salinity_min IS NULL OR salinity_max IS NULL OR salinity_min <= salinity_max),
  CHECK (ph_min IS NULL OR ph_max IS NULL OR ph_min <= ph_max),
  CHECK (kh_min IS NULL OR kh_max IS NULL OR kh_min <= kh_max),
  CHECK (calcium_min IS NULL OR calcium_max IS NULL OR calcium_min <= calcium_max),
  CHECK (magnesium_min IS NULL OR magnesium_max IS NULL OR magnesium_min <= magnesium_max),
  CHECK (nitrate_min IS NULL OR nitrate_max IS NULL OR nitrate_min <= nitrate_max),
  CHECK (phosphate_min IS NULL OR phosphate_max IS NULL OR phosphate_min <= phosphate_max)
);

CREATE INDEX IF NOT EXISTS coral_care_profiles_confidence_idx
  ON public.coral_care_profiles (confidence);

INSERT INTO public.coral_care_profiles (
  coral_entity_id,
  temperature_min,
  temperature_max,
  salinity_min,
  salinity_max,
  kh_min,
  kh_max,
  calcium_min,
  calcium_max,
  magnesium_min,
  magnesium_max,
  nitrate_min,
  nitrate_max,
  phosphate_min,
  phosphate_max,
  confidence,
  source_note
)
SELECT
  catalog.entity_id,
  CASE WHEN catalog.temperature IS NULL THEN NULL ELSE GREATEST(catalog.temperature - 1.0, 18) END,
  CASE WHEN catalog.temperature IS NULL THEN NULL ELSE LEAST(catalog.temperature + 1.0, 32) END,
  CASE WHEN catalog.salinity IS NULL THEN NULL ELSE GREATEST(catalog.salinity - 0.002, 1.015) END,
  CASE WHEN catalog.salinity IS NULL THEN NULL ELSE LEAST(catalog.salinity + 0.002, 1.032) END,
  CASE WHEN catalog.kh IS NULL THEN NULL ELSE GREATEST(catalog.kh - 1.0, 4) END,
  CASE WHEN catalog.kh IS NULL THEN NULL ELSE LEAST(catalog.kh + 1.0, 14) END,
  CASE WHEN catalog.calcium IS NULL THEN NULL ELSE GREATEST(catalog.calcium - 30, 300) END,
  CASE WHEN catalog.calcium IS NULL THEN NULL ELSE LEAST(catalog.calcium + 30, 560) END,
  CASE WHEN catalog.magnesium IS NULL THEN NULL ELSE GREATEST(catalog.magnesium - 80, 950) END,
  CASE WHEN catalog.magnesium IS NULL THEN NULL ELSE LEAST(catalog.magnesium + 80, 1700) END,
  CASE WHEN catalog.nitrate IS NULL THEN NULL ELSE GREATEST(catalog.nitrate - 5, 0) END,
  CASE WHEN catalog.nitrate IS NULL THEN NULL ELSE LEAST(catalog.nitrate + 5, 80) END,
  CASE WHEN catalog.phosphate IS NULL THEN NULL ELSE GREATEST(catalog.phosphate - 0.03, 0) END,
  CASE WHEN catalog.phosphate IS NULL THEN NULL ELSE LEAST(catalog.phosphate + 0.03, 1) END,
  'low',
  'Initial range generated from the existing curated coral catalog. Needs community review.'
FROM public.curated_coral_catalog catalog
WHERE catalog.entity_id IS NOT NULL
ON CONFLICT (coral_entity_id) DO UPDATE SET
  temperature_min = COALESCE(public.coral_care_profiles.temperature_min, EXCLUDED.temperature_min),
  temperature_max = COALESCE(public.coral_care_profiles.temperature_max, EXCLUDED.temperature_max),
  salinity_min = COALESCE(public.coral_care_profiles.salinity_min, EXCLUDED.salinity_min),
  salinity_max = COALESCE(public.coral_care_profiles.salinity_max, EXCLUDED.salinity_max),
  kh_min = COALESCE(public.coral_care_profiles.kh_min, EXCLUDED.kh_min),
  kh_max = COALESCE(public.coral_care_profiles.kh_max, EXCLUDED.kh_max),
  calcium_min = COALESCE(public.coral_care_profiles.calcium_min, EXCLUDED.calcium_min),
  calcium_max = COALESCE(public.coral_care_profiles.calcium_max, EXCLUDED.calcium_max),
  magnesium_min = COALESCE(public.coral_care_profiles.magnesium_min, EXCLUDED.magnesium_min),
  magnesium_max = COALESCE(public.coral_care_profiles.magnesium_max, EXCLUDED.magnesium_max),
  nitrate_min = COALESCE(public.coral_care_profiles.nitrate_min, EXCLUDED.nitrate_min),
  nitrate_max = COALESCE(public.coral_care_profiles.nitrate_max, EXCLUDED.nitrate_max),
  phosphate_min = COALESCE(public.coral_care_profiles.phosphate_min, EXCLUDED.phosphate_min),
  phosphate_max = COALESCE(public.coral_care_profiles.phosphate_max, EXCLUDED.phosphate_max),
  updated_at = NOW();

CREATE OR REPLACE FUNCTION public.jsonb_numeric_value(input_values JSONB, input_key TEXT)
RETURNS NUMERIC
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN input_values ? input_key
      AND input_values ->> input_key ~ '^-?[0-9]+(\.[0-9]+)?$'
      THEN (input_values ->> input_key)::NUMERIC
    ELSE NULL
  END;
$$;

CREATE OR REPLACE FUNCTION public.get_current_coral_risks(
  p_user_id UUID,
  p_aquarium_id UUID DEFAULT NULL
)
RETURNS TABLE (
  coral_entity_id UUID,
  coral_name TEXT,
  coral_category TEXT,
  confidence TEXT,
  current_values JSONB,
  is_compatible BOOLEAN,
  risk_count INTEGER,
  issues JSONB
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH latest_log AS (
    SELECT log.*
    FROM public.water_quality_logs log
    WHERE p_user_id = auth.uid()
      AND log.user_id = p_user_id
      AND (p_aquarium_id IS NULL OR log.aquarium_id = p_aquarium_id)
    ORDER BY log.measured_at DESC, log.created_at DESC
    LIMIT 1
  ),
  current_water AS (
    SELECT
      COALESCE(log.temperature, public.jsonb_numeric_value(log.custom_values, 'temperature')) AS temperature,
      COALESCE(log.salinity, public.jsonb_numeric_value(log.custom_values, 'salinity')) AS salinity,
      COALESCE(log.ph, public.jsonb_numeric_value(log.custom_values, 'ph')) AS ph,
      COALESCE(log.kh, public.jsonb_numeric_value(log.custom_values, 'kh')) AS kh,
      COALESCE(log.calcium, public.jsonb_numeric_value(log.custom_values, 'calcium')) AS calcium,
      COALESCE(log.magnesium, public.jsonb_numeric_value(log.custom_values, 'magnesium')) AS magnesium,
      COALESCE(log.nitrate, public.jsonb_numeric_value(log.custom_values, 'nitrate')) AS nitrate,
      COALESCE(log.phosphate, public.jsonb_numeric_value(log.custom_values, 'phosphate')) AS phosphate
    FROM latest_log log
  )
  SELECT
    catalog.entity_id AS coral_entity_id,
    catalog.trade_name AS coral_name,
    catalog.coral_category,
    profile.confidence,
    jsonb_build_object(
      'temperature', water.temperature,
      'salinity', water.salinity,
      'ph', water.ph,
      'kh', water.kh,
      'calcium', water.calcium,
      'magnesium', water.magnesium,
      'nitrate', water.nitrate,
      'phosphate', water.phosphate
    ) AS current_values,
    issue_summary.risk_count = 0 AS is_compatible,
    issue_summary.risk_count,
    issue_summary.issues
  FROM current_water water
  JOIN public.curated_coral_catalog catalog ON true
  JOIN public.coral_care_profiles profile ON profile.coral_entity_id = catalog.entity_id
  CROSS JOIN LATERAL (
    SELECT
      COUNT(*)::INTEGER AS risk_count,
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'key', issue.key,
            'label', issue.label,
            'status', issue.status,
            'current', issue.current_value,
            'min', issue.min_value,
            'max', issue.max_value
          )
          ORDER BY issue.display_order
        ),
        '[]'::JSONB
      ) AS issues
    FROM (
      SELECT
        compared.key,
        compared.label,
        compared.current_value,
        compared.min_value,
        compared.max_value,
        compared.display_order,
        CASE
          WHEN compared.min_value IS NOT NULL AND compared.current_value < compared.min_value THEN 'low'
          WHEN compared.max_value IS NOT NULL AND compared.current_value > compared.max_value THEN 'high'
        END AS status
      FROM (
        VALUES
          ('temperature', 'Water temperature', water.temperature, profile.temperature_min, profile.temperature_max, 10),
          ('salinity', 'Salinity', water.salinity, profile.salinity_min, profile.salinity_max, 20),
          ('ph', 'pH', water.ph, profile.ph_min, profile.ph_max, 30),
          ('kh', 'KH', water.kh, profile.kh_min, profile.kh_max, 40),
          ('calcium', 'Ca', water.calcium, profile.calcium_min, profile.calcium_max, 50),
          ('magnesium', 'Mg', water.magnesium, profile.magnesium_min, profile.magnesium_max, 60),
          ('nitrate', 'NO3', water.nitrate, profile.nitrate_min, profile.nitrate_max, 70),
          ('phosphate', 'PO4', water.phosphate, profile.phosphate_min, profile.phosphate_max, 80)
      ) AS compared(key, label, current_value, min_value, max_value, display_order)
      WHERE compared.current_value IS NOT NULL
        AND (
          (compared.min_value IS NOT NULL AND compared.current_value < compared.min_value)
          OR (compared.max_value IS NOT NULL AND compared.current_value > compared.max_value)
        )
    ) issue
  ) issue_summary
  WHERE catalog.review_status <> 'rejected'
  ORDER BY issue_summary.risk_count ASC, catalog.trade_name ASC;
$$;

CREATE OR REPLACE VIEW public.curated_coral_catalog AS
WITH entity_listings AS (
  SELECT
    entity.id AS entity_id,
    entity.canonical_name,
    entity.review_status,
    COALESCE(entity.genus, MAX(listing.genus) FILTER (WHERE listing.genus IS NOT NULL)) AS genus,
    COALESCE(entity.species, MAX(listing.species) FILTER (WHERE listing.species IS NOT NULL)) AS species,
    COALESCE(entity.coral_category, MAX(listing.coral_category) FILTER (WHERE listing.coral_category IS NOT NULL)) AS coral_category,
    MIN(listing.coral_master_id) AS representative_master_id,
    COUNT(listing.id)::INTEGER AS listing_count,
    COUNT(DISTINCT listing.source_shop)::INTEGER AS shop_count,
    ARRAY_AGG(DISTINCT listing.source_shop ORDER BY listing.source_shop) AS shops
  FROM public.coral_entities entity
  JOIN public.coral_listings listing ON listing.entity_id = entity.id
  WHERE entity.review_status <> 'rejected'
    AND entity.status = 'approved'
    AND listing.listing_type <> 'non_coral_candidate'
  GROUP BY entity.id
)
SELECT
  grouped.representative_master_id AS id,
  grouped.entity_id,
  grouped.canonical_name AS trade_name,
  NULL::TEXT AS brand_prefix,
  grouped.genus,
  grouped.species,
  grouped.coral_category,
  CASE
    WHEN grouped.shop_count = 1 THEN grouped.shops[1]
    ELSE grouped.shop_count || ' shops'
  END AS source_shop,
  master.common_name_jp,
  master.temperature,
  master.salinity,
  master.kh,
  master.calcium,
  master.magnesium,
  master.nitrate,
  master.phosphate,
  master.created_at,
  grouped.listing_count,
  grouped.shop_count,
  grouped.shops,
  grouped.review_status
FROM entity_listings grouped
JOIN public.coral_master_list master ON master.id = grouped.representative_master_id;

ALTER TABLE public.coral_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coral_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coral_care_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public coral entities read" ON public.coral_entities;
DROP POLICY IF EXISTS "coral entities wiki read" ON public.coral_entities;
DROP POLICY IF EXISTS "coral entities wiki insert" ON public.coral_entities;
DROP POLICY IF EXISTS "coral entities draft update" ON public.coral_entities;

CREATE POLICY "coral entities wiki read" ON public.coral_entities
  FOR SELECT
  USING (
    status = 'approved'
    OR created_by = auth.uid()
    OR public.is_app_admin()
  );

CREATE POLICY "coral entities wiki insert" ON public.coral_entities
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND updated_by = auth.uid()
    AND status IN ('draft', 'pending_review')
  );

CREATE POLICY "coral entities draft update" ON public.coral_entities
  FOR UPDATE TO authenticated
  USING (
    (created_by = auth.uid() AND status = 'draft')
    OR public.is_app_admin()
  )
  WITH CHECK (
    (created_by = auth.uid() AND status = 'draft')
    OR public.is_app_admin()
  );

DROP POLICY IF EXISTS "public coral references read" ON public.coral_references;
DROP POLICY IF EXISTS "users insert own coral references" ON public.coral_references;
DROP POLICY IF EXISTS "users update own draft coral references" ON public.coral_references;
DROP POLICY IF EXISTS "users delete own draft coral references" ON public.coral_references;

CREATE POLICY "public coral references read" ON public.coral_references
  FOR SELECT
  USING (
    status = 'approved'
    OR created_by = auth.uid()
    OR public.is_app_admin()
  );

CREATE POLICY "users insert own coral references" ON public.coral_references
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND status IN ('draft', 'approved')
  );

CREATE POLICY "users update own draft coral references" ON public.coral_references
  FOR UPDATE TO authenticated
  USING (
    (created_by = auth.uid() AND status = 'draft')
    OR public.is_app_admin()
  )
  WITH CHECK (
    (created_by = auth.uid() AND status = 'draft')
    OR public.is_app_admin()
  );

CREATE POLICY "users delete own draft coral references" ON public.coral_references
  FOR DELETE TO authenticated
  USING (
    (created_by = auth.uid() AND status = 'draft')
    OR public.is_app_admin()
  );

DROP POLICY IF EXISTS "public coral care profiles read" ON public.coral_care_profiles;
DROP POLICY IF EXISTS "users insert own coral care profiles" ON public.coral_care_profiles;
DROP POLICY IF EXISTS "users update own draft coral care profiles" ON public.coral_care_profiles;

CREATE POLICY "public coral care profiles read" ON public.coral_care_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.coral_entities entity
      WHERE entity.id = coral_entity_id
        AND (
          entity.status = 'approved'
          OR entity.created_by = auth.uid()
          OR public.is_app_admin()
        )
    )
  );

CREATE POLICY "users insert own coral care profiles" ON public.coral_care_profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.coral_entities entity
      WHERE entity.id = coral_entity_id
        AND entity.created_by = auth.uid()
        AND entity.status = 'draft'
    )
  );

CREATE POLICY "users update own draft coral care profiles" ON public.coral_care_profiles
  FOR UPDATE TO authenticated
  USING (
    public.is_app_admin()
    OR EXISTS (
      SELECT 1
      FROM public.coral_entities entity
      WHERE entity.id = coral_entity_id
        AND entity.created_by = auth.uid()
        AND entity.status = 'draft'
    )
  )
  WITH CHECK (
    public.is_app_admin()
    OR EXISTS (
      SELECT 1
      FROM public.coral_entities entity
      WHERE entity.id = coral_entity_id
        AND entity.created_by = auth.uid()
        AND entity.status = 'draft'
    )
  );

GRANT SELECT ON public.curated_coral_catalog TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.coral_entities TO authenticated;
GRANT SELECT ON public.coral_entities TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coral_references TO authenticated;
GRANT SELECT ON public.coral_references TO anon;
GRANT SELECT, INSERT, UPDATE ON public.coral_care_profiles TO authenticated;
GRANT SELECT ON public.coral_care_profiles TO anon;
GRANT EXECUTE ON FUNCTION public.jsonb_numeric_value(JSONB, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_app_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_coral_risks(UUID, UUID) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_current_coral_risks(UUID, UUID) FROM PUBLIC, anon;
