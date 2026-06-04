-- Normalized coral knowledge model and continuously calculated quality audit.

CREATE TABLE IF NOT EXISTS public.coral_taxa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scientific_name TEXT NOT NULL UNIQUE,
  accepted_scientific_name TEXT,
  family TEXT,
  genus TEXT,
  species TEXT,
  taxonomic_rank TEXT NOT NULL DEFAULT 'species',
  verification_status TEXT NOT NULL DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified', 'community', 'expert_review', 'verified')),
  external_ids JSONB NOT NULL DEFAULT '{}'::JSONB,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.coral_trade_names (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coral_master_id INTEGER NOT NULL UNIQUE REFERENCES public.coral_master_list(id) ON DELETE CASCADE,
  taxon_id UUID REFERENCES public.coral_taxa(id) ON DELETE SET NULL,
  trade_name TEXT NOT NULL,
  normalized_trade_name TEXT NOT NULL,
  brand_prefix TEXT,
  source_shop TEXT,
  source_url TEXT,
  observed_at DATE,
  verification_status TEXT NOT NULL DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified', 'community', 'expert_review', 'verified')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.coral_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coral_master_id INTEGER REFERENCES public.coral_master_list(id) ON DELETE CASCADE,
  taxon_id UUID REFERENCES public.coral_taxa(id) ON DELETE CASCADE,
  evidence_type TEXT NOT NULL
    CHECK (evidence_type IN ('shop_listing', 'public_database', 'paper', 'book', 'expert_review', 'community_observation')),
  source_name TEXT NOT NULL,
  source_url TEXT,
  citation TEXT,
  supports_fields TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  confidence NUMERIC(3, 2) NOT NULL DEFAULT 0.25 CHECK (confidence >= 0 AND confidence <= 1),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (coral_master_id IS NOT NULL OR taxon_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS coral_trade_names_normalized_idx
  ON public.coral_trade_names (normalized_trade_name);

CREATE INDEX IF NOT EXISTS coral_trade_names_taxon_idx
  ON public.coral_trade_names (taxon_id);

CREATE INDEX IF NOT EXISTS coral_evidence_master_idx
  ON public.coral_evidence (coral_master_id);

INSERT INTO public.coral_trade_names (
  coral_master_id,
  trade_name,
  normalized_trade_name,
  brand_prefix,
  source_shop,
  verification_status
)
SELECT
  id,
  trade_name,
  LOWER(REGEXP_REPLACE(TRIM(trade_name), '[^[:alnum:]]+', '', 'g')),
  brand_prefix,
  source_shop,
  'unverified'
FROM public.coral_master_list
WHERE trade_name IS NOT NULL AND TRIM(trade_name) <> ''
ON CONFLICT (coral_master_id) DO UPDATE SET
  trade_name = EXCLUDED.trade_name,
  normalized_trade_name = EXCLUDED.normalized_trade_name,
  brand_prefix = EXCLUDED.brand_prefix,
  source_shop = EXCLUDED.source_shop,
  updated_at = NOW();

INSERT INTO public.coral_evidence (
  coral_master_id,
  evidence_type,
  source_name,
  supports_fields,
  confidence
)
SELECT
  id,
  'shop_listing',
  source_shop,
  ARRAY['trade_name', 'brand_prefix', 'source_shop'],
  0.25
FROM public.coral_master_list master
WHERE source_shop IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.coral_evidence evidence
    WHERE evidence.coral_master_id = master.id
      AND evidence.evidence_type = 'shop_listing'
      AND evidence.source_name = master.source_shop
  );

CREATE OR REPLACE VIEW public.coral_record_quality AS
WITH duplicate_counts AS (
  SELECT
    LOWER(REGEXP_REPLACE(TRIM(trade_name), '[^[:alnum:]]+', '', 'g')) AS normalized_name,
    COUNT(*)::INTEGER AS duplicate_count
  FROM public.coral_master_list
  WHERE trade_name IS NOT NULL AND TRIM(trade_name) <> ''
  GROUP BY 1
)
SELECT
  master.id,
  master.trade_name,
  master.genus,
  master.species,
  master.coral_category,
  master.source_shop,
  master.common_name_jp,
  COALESCE(duplicates.duplicate_count, 1) AS duplicate_count,
  (
    (CASE WHEN master.trade_name IS NOT NULL THEN 15 ELSE 0 END) +
    (CASE WHEN master.genus IS NOT NULL THEN 20 ELSE 0 END) +
    (CASE WHEN master.species IS NOT NULL THEN 25 ELSE 0 END) +
    (CASE WHEN master.coral_category IS NOT NULL THEN 10 ELSE 0 END) +
    (CASE WHEN master.common_name_jp IS NOT NULL THEN 5 ELSE 0 END) +
    (CASE WHEN master.source_shop IS NOT NULL THEN 5 ELSE 0 END) +
    (CASE WHEN master.temperature IS NOT NULL THEN 3 ELSE 0 END) +
    (CASE WHEN master.salinity IS NOT NULL THEN 3 ELSE 0 END) +
    (CASE WHEN master.kh IS NOT NULL THEN 3 ELSE 0 END) +
    (CASE WHEN master.calcium IS NOT NULL THEN 3 ELSE 0 END) +
    (CASE WHEN master.magnesium IS NOT NULL THEN 3 ELSE 0 END) +
    (CASE WHEN master.nitrate IS NOT NULL THEN 3 ELSE 0 END) +
    (CASE WHEN master.phosphate IS NOT NULL THEN 2 ELSE 0 END)
  )::INTEGER AS quality_score,
  (
    (CASE WHEN master.temperature IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN master.salinity IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN master.kh IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN master.calcium IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN master.magnesium IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN master.nitrate IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN master.phosphate IS NOT NULL THEN 1 ELSE 0 END)
  )::INTEGER AS care_parameter_count,
  ARRAY_REMOVE(ARRAY[
    CASE WHEN master.genus IS NULL THEN 'missing_genus' END,
    CASE WHEN master.species IS NULL THEN 'missing_species' END,
    CASE WHEN master.coral_category IS NULL THEN 'missing_category' END,
    CASE WHEN master.common_name_jp IS NULL THEN 'missing_common_name_jp' END,
    CASE WHEN COALESCE(duplicates.duplicate_count, 1) > 1 THEN 'duplicate_candidate' END,
    CASE WHEN (
      (CASE WHEN master.temperature IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN master.salinity IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN master.kh IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN master.calcium IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN master.magnesium IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN master.nitrate IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN master.phosphate IS NOT NULL THEN 1 ELSE 0 END)
    ) < 7 THEN 'incomplete_care_profile' END
  ], NULL) AS quality_flags
FROM public.coral_master_list master
LEFT JOIN duplicate_counts duplicates
  ON duplicates.normalized_name = LOWER(REGEXP_REPLACE(TRIM(master.trade_name), '[^[:alnum:]]+', '', 'g'));

CREATE OR REPLACE VIEW public.coral_quality_summary AS
SELECT
  COUNT(*)::INTEGER AS total_records,
  COUNT(*) FILTER (WHERE genus IS NULL)::INTEGER AS missing_genus,
  COUNT(*) FILTER (WHERE species IS NULL)::INTEGER AS missing_species,
  COUNT(*) FILTER (WHERE coral_category IS NULL)::INTEGER AS missing_category,
  COUNT(*) FILTER (WHERE common_name_jp IS NULL)::INTEGER AS missing_common_name_jp,
  COUNT(*) FILTER (WHERE duplicate_count > 1)::INTEGER AS duplicate_candidate_rows,
  COUNT(*) FILTER (WHERE care_parameter_count = 7)::INTEGER AS complete_care_profiles,
  ROUND(AVG(quality_score), 1) AS average_quality_score,
  COUNT(*) FILTER (WHERE quality_score >= 80)::INTEGER AS high_quality_records,
  COUNT(*) FILTER (WHERE quality_score < 50)::INTEGER AS low_quality_records
FROM public.coral_record_quality;

CREATE OR REPLACE VIEW public.coral_source_quality AS
SELECT
  source_shop,
  COUNT(*)::INTEGER AS record_count,
  ROUND(AVG(quality_score), 1) AS average_quality_score,
  COUNT(*) FILTER (WHERE species IS NOT NULL)::INTEGER AS species_identified,
  COUNT(*) FILTER (WHERE duplicate_count > 1)::INTEGER AS duplicate_candidate_rows
FROM public.coral_record_quality
GROUP BY source_shop
ORDER BY record_count DESC;

ALTER TABLE public.coral_taxa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coral_trade_names ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coral_evidence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public coral taxa read" ON public.coral_taxa;
DROP POLICY IF EXISTS "public coral trade names read" ON public.coral_trade_names;
DROP POLICY IF EXISTS "public coral evidence read" ON public.coral_evidence;

CREATE POLICY "public coral taxa read" ON public.coral_taxa FOR SELECT USING (true);
CREATE POLICY "public coral trade names read" ON public.coral_trade_names FOR SELECT USING (true);
CREATE POLICY "public coral evidence read" ON public.coral_evidence FOR SELECT USING (true);

GRANT SELECT ON public.coral_record_quality TO anon, authenticated;
GRANT SELECT ON public.coral_quality_summary TO anon, authenticated;
GRANT SELECT ON public.coral_source_quality TO anon, authenticated;
