-- Cache second-pass cleanup candidates so the app does not run expensive regex
-- grouping on every page load.

DROP VIEW IF EXISTS public.coral_cleanup_summary;
DROP VIEW IF EXISTS public.coral_refinement_candidates;

CREATE TABLE IF NOT EXISTS public.coral_refinement_candidates_cache (
  refinement_key TEXT PRIMARY KEY,
  suggested_name TEXT NOT NULL,
  listing_count INTEGER NOT NULL,
  entity_count INTEGER NOT NULL,
  shop_count INTEGER NOT NULL,
  sized_listing_count INTEGER NOT NULL,
  missing_genus_count INTEGER NOT NULL,
  missing_category_count INTEGER NOT NULL,
  inferred_genus TEXT,
  inferred_category TEXT,
  shops TEXT[],
  listing_names TEXT[],
  entity_ids UUID[],
  issue_flags TEXT[],
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

TRUNCATE public.coral_refinement_candidates_cache;

INSERT INTO public.coral_refinement_candidates_cache (
  refinement_key,
  suggested_name,
  listing_count,
  entity_count,
  shop_count,
  sized_listing_count,
  missing_genus_count,
  missing_category_count,
  inferred_genus,
  inferred_category,
  shops,
  listing_names,
  entity_ids,
  issue_flags
)
WITH enriched AS (
  SELECT
    listing.*,
    public.normalize_coral_refinement_key(listing.listing_name) AS refinement_key,
    COALESCE(listing.genus, public.infer_coral_genus_from_name(listing.listing_name)) AS inferred_genus,
    COALESCE(listing.coral_category, public.infer_coral_category_from_name(listing.listing_name)) AS inferred_category
  FROM public.coral_listings listing
  WHERE listing.listing_type <> 'non_coral_candidate'
),
grouped AS (
  SELECT
    refinement_key,
    INITCAP(refinement_key) AS suggested_name,
    COUNT(*)::INTEGER AS listing_count,
    COUNT(DISTINCT entity_id)::INTEGER AS entity_count,
    COUNT(DISTINCT source_shop)::INTEGER AS shop_count,
    COUNT(*) FILTER (WHERE size_label IS NOT NULL)::INTEGER AS sized_listing_count,
    COUNT(*) FILTER (WHERE inferred_genus IS NULL)::INTEGER AS missing_genus_count,
    COUNT(*) FILTER (WHERE inferred_category IS NULL)::INTEGER AS missing_category_count,
    CASE WHEN COUNT(DISTINCT inferred_genus) FILTER (WHERE inferred_genus IS NOT NULL) = 1 THEN MAX(inferred_genus) END AS inferred_genus,
    CASE WHEN COUNT(DISTINCT inferred_category) FILTER (WHERE inferred_category IS NOT NULL) = 1 THEN MAX(inferred_category) END AS inferred_category,
    ARRAY_AGG(DISTINCT source_shop ORDER BY source_shop) AS shops,
    ARRAY_AGG(DISTINCT listing_name ORDER BY listing_name) AS listing_names,
    ARRAY_AGG(DISTINCT entity_id) AS entity_ids
  FROM enriched
  WHERE refinement_key <> ''
  GROUP BY refinement_key
)
SELECT
  refinement_key,
  suggested_name,
  listing_count,
  entity_count,
  shop_count,
  sized_listing_count,
  missing_genus_count,
  missing_category_count,
  inferred_genus,
  inferred_category,
  shops,
  listing_names,
  entity_ids,
  ARRAY_REMOVE(ARRAY[
    CASE WHEN entity_count > 1 THEN 'cross_entity_merge_candidate' END,
    CASE WHEN sized_listing_count > 0 THEN 'size_variant' END,
    CASE WHEN missing_genus_count > 0 AND inferred_genus IS NOT NULL THEN 'genus_can_be_inferred' END,
    CASE WHEN missing_category_count > 0 AND inferred_category IS NOT NULL THEN 'category_can_be_inferred' END
  ], NULL) AS issue_flags
FROM grouped
WHERE listing_count > 1
  AND (
    entity_count > 1
    OR sized_listing_count > 0
    OR (missing_genus_count > 0 AND inferred_genus IS NOT NULL)
    OR (missing_category_count > 0 AND inferred_category IS NOT NULL)
  );

CREATE INDEX IF NOT EXISTS coral_refinement_candidates_cache_priority_idx
  ON public.coral_refinement_candidates_cache (entity_count DESC, listing_count DESC, suggested_name);

ALTER TABLE public.coral_refinement_candidates_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public coral refinement cache read" ON public.coral_refinement_candidates_cache;
CREATE POLICY "public coral refinement cache read" ON public.coral_refinement_candidates_cache
  FOR SELECT USING (true);

CREATE OR REPLACE VIEW public.coral_refinement_candidates AS
SELECT *
FROM public.coral_refinement_candidates_cache
ORDER BY entity_count DESC, listing_count DESC, suggested_name;

CREATE OR REPLACE VIEW public.coral_cleanup_summary AS
SELECT
  (SELECT COUNT(*)::INTEGER FROM public.coral_listings) AS total_listings,
  (SELECT COUNT(*)::INTEGER FROM public.coral_listings WHERE listing_type = 'non_coral_candidate') AS non_coral_candidates,
  (SELECT COUNT(*)::INTEGER FROM public.coral_listings WHERE listing_type <> 'non_coral_candidate' AND genus IS NULL) AS missing_genus,
  (SELECT COUNT(*)::INTEGER FROM public.coral_listings WHERE listing_type <> 'non_coral_candidate' AND coral_category IS NULL) AS missing_category,
  (SELECT COUNT(*)::INTEGER FROM public.coral_refinement_candidates_cache) AS refinement_groups,
  (SELECT COUNT(*)::INTEGER FROM public.coral_refinement_candidates_cache WHERE entity_count > 1) AS cross_entity_groups;

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

GRANT SELECT ON public.coral_refinement_candidates_cache TO anon, authenticated;
GRANT SELECT ON public.coral_refinement_candidates TO anon, authenticated;
GRANT SELECT ON public.coral_cleanup_summary TO anon, authenticated;
GRANT SELECT ON public.curated_coral_catalog TO anon, authenticated;
