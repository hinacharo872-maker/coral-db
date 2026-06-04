-- Separate biological/market identity from individual shop listings.
-- Candidate groups are reversible and must be reviewed before becoming canonical.

CREATE OR REPLACE FUNCTION public.normalize_coral_listing_name(input_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  result TEXT;
BEGIN
  result := UPPER(COALESCE(input_name, ''));
  result := REGEXP_REPLACE(result, '[®™]', '', 'g');
  result := REGEXP_REPLACE(result, '^\s*(XXL|XL|LARGE|MEDIUM|SMALL|MINI)\s+', '', 'i');
  result := REGEXP_REPLACE(result, '^\s*(JF|TSA|WWC|ASD|UC|ORA|BC|RR|RRC|CB|TG|PC|ARC|GB)\s+', '', 'i');
  result := REGEXP_REPLACE(result, '\m[0-9]+\s*(HEADS?|POLYPS?|INCHES?|IN|CM|MM)\M', ' ', 'gi');
  result := REGEXP_REPLACE(result, '\m(XXL|XL|LARGE|MEDIUM|SMALL|MINI\s+COLONY|COLONY|FRAG|WYSIWYG)\M', ' ', 'gi');
  result := REGEXP_REPLACE(result, '\m(CORAL|CORALS)\M$', ' ', 'gi');
  result := REGEXP_REPLACE(result, '\s+', ' ', 'g');
  RETURN TRIM(result);
END;
$$;

CREATE OR REPLACE FUNCTION public.extract_coral_listing_size(input_name TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT NULLIF(
    UPPER((REGEXP_MATCH(
      COALESCE(input_name, ''),
      '(XXL|XL|LARGE|MEDIUM|SMALL|MINI COLONY|COLONY|FRAG|[0-9]+\s*(?:HEADS?|POLYPS?|INCHES?|IN|CM|MM))',
      'i'
    ))[1]),
    ''
  );
$$;

CREATE TABLE IF NOT EXISTS public.coral_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name TEXT NOT NULL,
  candidate_key TEXT NOT NULL UNIQUE,
  genus TEXT,
  species TEXT,
  coral_category TEXT,
  review_status TEXT NOT NULL DEFAULT 'candidate'
    CHECK (review_status IN ('candidate', 'confirmed', 'rejected', 'needs_split')),
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.coral_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coral_master_id INTEGER NOT NULL UNIQUE REFERENCES public.coral_master_list(id) ON DELETE CASCADE,
  entity_id UUID REFERENCES public.coral_entities(id) ON DELETE SET NULL,
  listing_name TEXT NOT NULL,
  cleaned_name TEXT NOT NULL,
  size_label TEXT,
  source_shop TEXT NOT NULL,
  brand_prefix TEXT,
  genus TEXT,
  species TEXT,
  coral_category TEXT,
  listing_type TEXT NOT NULL DEFAULT 'coral'
    CHECK (listing_type IN ('coral', 'non_coral_candidate', 'unknown')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS coral_listings_cleaned_name_idx
  ON public.coral_listings (cleaned_name);

CREATE INDEX IF NOT EXISTS coral_listings_entity_idx
  ON public.coral_listings (entity_id);

INSERT INTO public.coral_entities (
  canonical_name,
  candidate_key,
  genus,
  species,
  coral_category,
  review_status
)
SELECT
  INITCAP(normalized.cleaned_name),
  LOWER(normalized.cleaned_name),
  CASE WHEN COUNT(DISTINCT master.genus) FILTER (WHERE master.genus IS NOT NULL) = 1 THEN MAX(master.genus) END,
  CASE WHEN COUNT(DISTINCT master.species) FILTER (WHERE master.species IS NOT NULL) = 1 THEN MAX(master.species) END,
  CASE WHEN COUNT(DISTINCT master.coral_category) FILTER (WHERE master.coral_category IS NOT NULL) = 1 THEN MAX(master.coral_category) END,
  'candidate'
FROM public.coral_master_list master
CROSS JOIN LATERAL (
  SELECT public.normalize_coral_listing_name(master.trade_name) AS cleaned_name
) normalized
WHERE master.trade_name IS NOT NULL
  AND normalized.cleaned_name <> ''
GROUP BY normalized.cleaned_name
ON CONFLICT (candidate_key) DO UPDATE SET
  canonical_name = EXCLUDED.canonical_name,
  genus = COALESCE(public.coral_entities.genus, EXCLUDED.genus),
  species = COALESCE(public.coral_entities.species, EXCLUDED.species),
  coral_category = COALESCE(public.coral_entities.coral_category, EXCLUDED.coral_category),
  updated_at = NOW();

INSERT INTO public.coral_listings (
  coral_master_id,
  entity_id,
  listing_name,
  cleaned_name,
  size_label,
  source_shop,
  brand_prefix,
  genus,
  species,
  coral_category,
  listing_type
)
SELECT
  master.id,
  entity.id,
  master.trade_name,
  public.normalize_coral_listing_name(master.trade_name),
  public.extract_coral_listing_size(master.trade_name),
  master.source_shop,
  master.brand_prefix,
  master.genus,
  master.species,
  master.coral_category,
  CASE
    WHEN master.trade_name ~* '\m(SHRIMP|FISH|CRAB|SNAIL|FOOD|FEEDER|RING|PACK|GLUE|DIP|RX|KIT|ROCK)\M'
      THEN 'non_coral_candidate'
    WHEN master.genus IS NULL AND master.coral_category IS NULL
      THEN 'unknown'
    ELSE 'coral'
  END
FROM public.coral_master_list master
JOIN public.coral_entities entity
  ON entity.candidate_key = LOWER(public.normalize_coral_listing_name(master.trade_name))
WHERE master.trade_name IS NOT NULL
ON CONFLICT (coral_master_id) DO UPDATE SET
  entity_id = EXCLUDED.entity_id,
  listing_name = EXCLUDED.listing_name,
  cleaned_name = EXCLUDED.cleaned_name,
  size_label = EXCLUDED.size_label,
  source_shop = EXCLUDED.source_shop,
  brand_prefix = EXCLUDED.brand_prefix,
  genus = EXCLUDED.genus,
  species = EXCLUDED.species,
  coral_category = EXCLUDED.coral_category,
  listing_type = EXCLUDED.listing_type,
  updated_at = NOW();

CREATE OR REPLACE VIEW public.coral_identity_candidates AS
SELECT
  entity.id AS entity_id,
  entity.canonical_name,
  entity.candidate_key,
  entity.genus,
  entity.species,
  entity.coral_category,
  entity.review_status,
  COUNT(listing.id)::INTEGER AS listing_count,
  COUNT(DISTINCT listing.source_shop)::INTEGER AS shop_count,
  COUNT(DISTINCT listing.listing_name)::INTEGER AS name_variant_count,
  COUNT(*) FILTER (WHERE listing.size_label IS NOT NULL)::INTEGER AS sized_listing_count,
  ARRAY_AGG(DISTINCT listing.source_shop ORDER BY listing.source_shop) AS shops,
  ARRAY_AGG(DISTINCT listing.listing_name ORDER BY listing.listing_name) AS listing_names,
  ARRAY_AGG(DISTINCT listing.size_label ORDER BY listing.size_label)
    FILTER (WHERE listing.size_label IS NOT NULL) AS size_labels,
  CASE
    WHEN COUNT(DISTINCT listing.genus) FILTER (WHERE listing.genus IS NOT NULL) > 1 THEN true
    ELSE false
  END AS genus_conflict,
  CASE
    WHEN COUNT(DISTINCT listing.coral_category) FILTER (WHERE listing.coral_category IS NOT NULL) > 1 THEN true
    ELSE false
  END AS category_conflict
FROM public.coral_entities entity
JOIN public.coral_listings listing ON listing.entity_id = entity.id
WHERE listing.listing_type <> 'non_coral_candidate'
GROUP BY entity.id
HAVING COUNT(listing.id) > 1
ORDER BY COUNT(listing.id) DESC, entity.canonical_name;

CREATE OR REPLACE VIEW public.coral_identity_summary AS
SELECT
  (SELECT COUNT(*)::INTEGER FROM public.coral_listings) AS total_listings,
  (SELECT COUNT(*)::INTEGER FROM public.coral_entities) AS candidate_entities,
  (SELECT COUNT(*)::INTEGER FROM public.coral_identity_candidates) AS duplicate_candidate_groups,
  (SELECT COALESCE(SUM(listing_count), 0)::INTEGER FROM public.coral_identity_candidates) AS grouped_listing_count,
  (SELECT COUNT(*)::INTEGER FROM public.coral_identity_candidates WHERE shop_count > 1) AS cross_shop_groups,
  (SELECT COUNT(*)::INTEGER FROM public.coral_identity_candidates WHERE sized_listing_count > 0) AS size_variant_groups,
  (SELECT COUNT(*)::INTEGER FROM public.coral_listings WHERE listing_type = 'non_coral_candidate') AS non_coral_candidates,
  (SELECT COUNT(*)::INTEGER FROM public.coral_identity_candidates WHERE genus_conflict OR category_conflict) AS conflict_groups;

ALTER TABLE public.coral_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coral_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public coral entities read" ON public.coral_entities;
DROP POLICY IF EXISTS "public coral listings read" ON public.coral_listings;

CREATE POLICY "public coral entities read" ON public.coral_entities FOR SELECT USING (true);
CREATE POLICY "public coral listings read" ON public.coral_listings FOR SELECT USING (true);

GRANT SELECT ON public.coral_identity_candidates TO anon, authenticated;
GRANT SELECT ON public.coral_identity_summary TO anon, authenticated;
