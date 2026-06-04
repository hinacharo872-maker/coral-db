-- Create the application schema for projects whose migration history was
-- initialized after the original schema migration was committed.

CREATE TABLE IF NOT EXISTS public.coral_master_list (
  id SERIAL PRIMARY KEY,
  trade_name TEXT,
  brand_prefix TEXT,
  genus TEXT,
  species TEXT,
  coral_category TEXT,
  source_shop TEXT,
  common_name_jp TEXT,
  temperature NUMERIC(4, 1),
  salinity NUMERIC(5, 3),
  kh NUMERIC(4, 1),
  calcium NUMERIC(6, 1),
  magnesium NUMERIC(6, 1),
  nitrate NUMERIC(6, 2),
  phosphate NUMERIC(6, 3),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.aquariums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  volume_liters NUMERIC(7, 2),
  started_on DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.water_quality_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aquarium_id UUID NOT NULL REFERENCES public.aquariums(id) ON DELETE CASCADE,
  measured_at DATE NOT NULL DEFAULT CURRENT_DATE,
  temperature NUMERIC(4, 1),
  salinity NUMERIC(5, 3),
  ph NUMERIC(3, 1),
  kh NUMERIC(4, 1),
  calcium NUMERIC(6, 1),
  magnesium NUMERIC(6, 1),
  nitrate NUMERIC(6, 2),
  phosphate NUMERIC(6, 3),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS water_quality_logs_aquarium_measured_at_idx
  ON public.water_quality_logs (aquarium_id, measured_at DESC, created_at DESC);

ALTER TABLE public.coral_master_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aquariums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_quality_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public coral read" ON public.coral_master_list;
DROP POLICY IF EXISTS "public aquarium read" ON public.aquariums;
DROP POLICY IF EXISTS "public aquarium insert" ON public.aquariums;
DROP POLICY IF EXISTS "public aquarium update" ON public.aquariums;
DROP POLICY IF EXISTS "public water log read" ON public.water_quality_logs;
DROP POLICY IF EXISTS "public water log insert" ON public.water_quality_logs;
DROP POLICY IF EXISTS "public water log delete" ON public.water_quality_logs;

CREATE POLICY "public coral read" ON public.coral_master_list
  FOR SELECT USING (true);

CREATE POLICY "public aquarium read" ON public.aquariums
  FOR SELECT USING (true);

CREATE POLICY "public aquarium insert" ON public.aquariums
  FOR INSERT WITH CHECK (true);

CREATE POLICY "public aquarium update" ON public.aquariums
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "public water log read" ON public.water_quality_logs
  FOR SELECT USING (true);

CREATE POLICY "public water log insert" ON public.water_quality_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "public water log delete" ON public.water_quality_logs
  FOR DELETE USING (true);

INSERT INTO public.aquariums (name, notes)
SELECT 'Main Reef Tank', 'Default aquarium created by the production schema migration.'
WHERE NOT EXISTS (SELECT 1 FROM public.aquariums);
