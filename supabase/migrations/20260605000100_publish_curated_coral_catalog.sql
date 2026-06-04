-- Publish one catalog row per reviewed coral identity while preserving listings.

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

CREATE OR REPLACE VIEW public.curated_coral_catalog_summary AS
SELECT
  COUNT(*)::INTEGER AS catalog_records,
  COALESCE(SUM(listing_count), 0)::INTEGER AS source_listings,
  COALESCE(SUM(listing_count - 1), 0)::INTEGER AS merged_duplicate_listings,
  COUNT(*) FILTER (WHERE shop_count > 1)::INTEGER AS multi_shop_corals,
  COUNT(*) FILTER (WHERE genus IS NULL)::INTEGER AS missing_genus,
  COUNT(*) FILTER (WHERE coral_category IS NULL)::INTEGER AS missing_category
FROM public.curated_coral_catalog;

GRANT SELECT ON public.curated_coral_catalog TO anon, authenticated;
GRANT SELECT ON public.curated_coral_catalog_summary TO anon, authenticated;
