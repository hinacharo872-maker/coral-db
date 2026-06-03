-- Aqua Reef Log water quality schema for Supabase.
-- Run this in the Supabase SQL editor after supabase-setup.sql.
--
-- MVP policy note:
-- This app currently has no user login, so the anon key can read and write
-- aquarium and water log rows. Tighten these policies when authentication is added.

CREATE TABLE IF NOT EXISTS aquariums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  volume_liters NUMERIC(7, 2),
  started_on DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS water_quality_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aquarium_id UUID NOT NULL REFERENCES aquariums(id) ON DELETE CASCADE,
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
  ON water_quality_logs (aquarium_id, measured_at DESC, created_at DESC);

ALTER TABLE aquariums ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_quality_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public aquarium read" ON aquariums;
DROP POLICY IF EXISTS "public aquarium insert" ON aquariums;
DROP POLICY IF EXISTS "public aquarium update" ON aquariums;
DROP POLICY IF EXISTS "public water log read" ON water_quality_logs;
DROP POLICY IF EXISTS "public water log insert" ON water_quality_logs;
DROP POLICY IF EXISTS "public water log delete" ON water_quality_logs;

CREATE POLICY "public aquarium read" ON aquariums
  FOR SELECT USING (true);

CREATE POLICY "public aquarium insert" ON aquariums
  FOR INSERT WITH CHECK (true);

CREATE POLICY "public aquarium update" ON aquariums
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "public water log read" ON water_quality_logs
  FOR SELECT USING (true);

CREATE POLICY "public water log insert" ON water_quality_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "public water log delete" ON water_quality_logs
  FOR DELETE USING (true);

INSERT INTO aquariums (name, volume_liters, notes)
SELECT 'Main Reef Tank', NULL, 'Default aquarium created by Aqua Reef Log setup.'
WHERE NOT EXISTS (SELECT 1 FROM aquariums);
