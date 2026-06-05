-- Second-pass coral cleanup: classify obvious non-coral products, infer simple taxonomy,
-- and expose candidate groups that need a follow-up review.

CREATE OR REPLACE FUNCTION public.infer_coral_genus_from_name(input_name TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN input_name ~* '\m(ACROPORA|ACRO)\M' THEN 'Acropora'
    WHEN input_name ~* '\m(MONTIPORA|MONTI)\M' THEN 'Montipora'
    WHEN input_name ~* '\m(GONIOPORA|GONI|ハナガサ|アワサンゴ)\M' THEN 'Goniopora'
    WHEN input_name ~* '\m(ALVEOPORA)\M' THEN 'Alveopora'
    WHEN input_name ~* '\m(BLASTOMUSSA|BLASTO)\M' THEN 'Blastomussa'
    WHEN input_name ~* '\m(MICROMUSSA|AUSSIE LORD|LORDHOWENSIS|カクオオトゲ)\M' THEN 'Micromussa'
    WHEN input_name ~* '\m(ACANTHASTREA|ACANTHO)\M' THEN 'Acanthastrea'
    WHEN input_name ~* '\m(EUPHYLLIA|TORCH|HAMMER|FROGSPAWN)\M' THEN 'Euphyllia'
    WHEN input_name ~* '\m(FAVIA)\M' THEN 'Favia'
    WHEN input_name ~* '\m(FAVITES)\M' THEN 'Favites'
    WHEN input_name ~* '\m(CYPHASTREA)\M' THEN 'Cyphastrea'
    WHEN input_name ~* '\m(PECTINIA)\M' THEN 'Pectinia'
    WHEN input_name ~* '\m(SCOLYMIA|SCOLY)\M' THEN 'Scolymia'
    WHEN input_name ~* '\m(TRACHYPHYLLIA|TRACHY)\M' THEN 'Trachyphyllia'
    WHEN input_name ~* '\m(PLATYGYRA|MAZE BRAIN)\M' THEN 'Platygyra'
    WHEN input_name ~* '\m(LOBOPHYLLIA)\M' THEN 'Lobophyllia'
    WHEN input_name ~* '\m(LEPTASTREA)\M' THEN 'Leptastrea'
    WHEN input_name ~* '\m(LEPTOSERIS)\M' THEN 'Leptoseris'
    WHEN input_name ~* '\m(PSAMMOCORA)\M' THEN 'Psammocora'
    WHEN input_name ~* '\m(PAVONA)\M' THEN 'Pavona'
    WHEN input_name ~* '\m(STYLOPHORA|STYLO)\M' THEN 'Stylophora'
    WHEN input_name ~* '\m(POCILLOPORA)\M' THEN 'Pocillopora'
    WHEN input_name ~* '\m(PORITES)\M' THEN 'Porites'
    WHEN input_name ~* '\m(RICORDEA)\M' THEN 'Ricordea'
    WHEN input_name ~* '\m(RHODACTIS)\M' THEN 'Rhodactis'
    WHEN input_name ~* '\m(SARCOPHYTON|TOADSTOOL)\M' THEN 'Sarcophyton'
    WHEN input_name ~* '\m(SINULARIA)\M' THEN 'Sinularia'
    WHEN input_name ~* '\m(XENIA)\M' THEN 'Xenia'
    WHEN input_name ~* '\m(DUNCAN)\M' THEN 'Duncanopsammia'
    WHEN input_name ~* '\m(ZOANTHID|ZOANTHIDS|ZOA|マメスナ)\M' THEN 'Zoanthus'
    WHEN input_name ~* '\m(PALYTHOA|PALY)\M' THEN 'Palythoa'
    ELSE NULL
  END;
$$;

CREATE OR REPLACE FUNCTION public.infer_coral_category_from_name(input_name TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN input_name ~* '\m(ACROPORA|ACRO|MONTIPORA|MONTI|STYLOPHORA|STYLO|POCILLOPORA|PORITES|SPS|ミドリイシ)\M' THEN 'SPS'
    WHEN input_name ~* '\m(EUPHYLLIA|TORCH|HAMMER|FROGSPAWN|GONIOPORA|GONI|ALVEOPORA|BLASTOMUSSA|BLASTO|MICROMUSSA|AUSSIE LORD|ACANTHASTREA|ACANTHO|FAVIA|FAVITES|CYPHASTREA|PECTINIA|SCOLYMIA|SCOLY|TRACHYPHYLLIA|TRACHY|PLATYGYRA|LOBOPHYLLIA|LEPTASTREA|LEPTOSERIS|PSAMMOCORA|PAVONA|DUNCAN|LPS|ハナガサ|アワサンゴ|カクオオトゲ)\M' THEN 'LPS'
    WHEN input_name ~* '\m(MUSHROOM|RICORDEA|RHODACTIS|ZOANTHID|ZOANTHIDS|ZOA|PALYTHOA|PALY|CLOVE|GSP|GREEN STAR POLYP|XENIA|SARCOPHYTON|TOADSTOOL|SINULARIA|SOFT|マメスナ)\M' THEN 'Soft Coral'
    ELSE NULL
  END;
$$;

CREATE OR REPLACE FUNCTION public.normalize_coral_refinement_key(input_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  result TEXT;
BEGIN
  result := UPPER(COALESCE(input_name, ''));
  result := REGEXP_REPLACE(result, '[®™]', '', 'g');
  result := REGEXP_REPLACE(result, '[【】\[\]\(\)（）#,/]', ' ', 'g');
  result := REGEXP_REPLACE(result, '\m(JASON FOX|WORLD WIDE CORALS|CORN BRED|AQUA SD|CALI KID|JF|WWC|TSA|ASD|UC|ORA|BC|RR|RRC|CB|TG|PC|ARC|GB|CC|RFA|TCK|RMF|VIVID|TYREE|GARF)\M', ' ', 'gi');
  result := REGEXP_REPLACE(result, '\m(XXL|XL|LARGE|MEDIUM|SMALL|MINI COLONY|MINI|MOTHER COLONY|COLONY|FRAG|WYSIWYG|SHOW SIZE|CHUNK|CUT TO ORDER|ULTRA|SUPER|PREMIUM|RARE|LIMITED|GRADE|AUSSIE|INDO|INDONESIA|AUSTRALIA|AUSTRALIAN|FIJI|TONGA|VIETNAM|VIETNAMESE|AQUACULTURED|MARICULTURED|CULTURED|LIVE|CORAL|CORALS|LPS|SPS)\M', ' ', 'gi');
  result := REGEXP_REPLACE(result, '(現物|サンゴ|コーラル|海水|オーストラリア産|インドネシア産|インドネシア|オーストラリア)', ' ', 'g');
  result := REGEXP_REPLACE(result, '\m[0-9]+(\.[0-9]+)?\s*(HEADS?|POLYPS?|EYES?|MOUTHS?|INCHES?|IN|CM|MM|FRAGS?)\M', ' ', 'gi');
  result := REGEXP_REPLACE(result, '\m[0-9]{3,}\M', ' ', 'g');
  result := REGEXP_REPLACE(result, '\m[0-9]+(\.[0-9]+)?\M', ' ', 'g');
  result := REGEXP_REPLACE(result, '\m(SP|SPP)\M\.?', ' ', 'gi');
  result := REGEXP_REPLACE(result, '\s+', ' ', 'g');
  RETURN TRIM(result);
END;
$$;

UPDATE public.coral_listings
SET
  listing_type = 'non_coral_candidate',
  updated_at = NOW()
WHERE listing_name ~* '\m(HANNA|CHECKER|REAGENT|TEST KIT|TESTER|REEFER|SKIMMER|PROTEIN SKIMMER|DELTEC|PUMP|DOSER|FILTER|MEDIA|CARBON|GFO|RESIN|SALT|GLUE|DIP|RX|ROCK|AQUASCAPE|AQUARIUM|TANK|LIGHT|LED|BRACKET|MOUNT|RETURN PUMP|POWERHEAD|WAVE PUMP|FOOD|FEEDER|RING|PACK)\M'
   OR listing_name ~* '(試薬|測定器|水槽|プロテインスキマー|ライブロック|接着剤|人工海水|フード)';

UPDATE public.coral_listings
SET
  genus = COALESCE(genus, public.infer_coral_genus_from_name(listing_name)),
  coral_category = COALESCE(coral_category, public.infer_coral_category_from_name(listing_name)),
  updated_at = NOW()
WHERE listing_type <> 'non_coral_candidate'
  AND (
    genus IS NULL
    OR coral_category IS NULL
  );

CREATE OR REPLACE VIEW public.coral_refinement_candidates AS
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
  )
ORDER BY entity_count DESC, listing_count DESC, suggested_name;

CREATE OR REPLACE VIEW public.coral_cleanup_summary AS
SELECT
  (SELECT COUNT(*)::INTEGER FROM public.coral_listings) AS total_listings,
  (SELECT COUNT(*)::INTEGER FROM public.coral_listings WHERE listing_type = 'non_coral_candidate') AS non_coral_candidates,
  (SELECT COUNT(*)::INTEGER FROM public.coral_listings WHERE listing_type <> 'non_coral_candidate' AND genus IS NULL) AS missing_genus,
  (SELECT COUNT(*)::INTEGER FROM public.coral_listings WHERE listing_type <> 'non_coral_candidate' AND coral_category IS NULL) AS missing_category,
  (SELECT COUNT(*)::INTEGER FROM public.coral_refinement_candidates) AS refinement_groups,
  (SELECT COUNT(*)::INTEGER FROM public.coral_refinement_candidates WHERE entity_count > 1) AS cross_entity_groups;

CREATE OR REPLACE VIEW public.curated_coral_catalog AS
WITH entity_listings AS (
  SELECT
    entity.id AS entity_id,
    entity.canonical_name,
    entity.review_status,
    COALESCE(entity.genus, MAX(listing.genus) FILTER (WHERE listing.genus IS NOT NULL), MAX(public.infer_coral_genus_from_name(listing.listing_name))) AS genus,
    COALESCE(entity.species, MAX(listing.species) FILTER (WHERE listing.species IS NOT NULL)) AS species,
    COALESCE(entity.coral_category, MAX(listing.coral_category) FILTER (WHERE listing.coral_category IS NOT NULL), MAX(public.infer_coral_category_from_name(listing.listing_name))) AS coral_category,
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

GRANT EXECUTE ON FUNCTION public.infer_coral_genus_from_name(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.infer_coral_category_from_name(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.normalize_coral_refinement_key(TEXT) TO anon, authenticated;
GRANT SELECT ON public.coral_refinement_candidates TO anon, authenticated;
GRANT SELECT ON public.coral_cleanup_summary TO anon, authenticated;
GRANT SELECT ON public.curated_coral_catalog TO anon, authenticated;
GRANT SELECT ON public.curated_coral_catalog_summary TO anon, authenticated;
