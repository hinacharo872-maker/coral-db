-- Aqua Reef Log water quality tables for Supabase.
-- Run this after supabase-setup.sql when you want to persist water logs in the database.

CREATE TABLE aquariums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  volume_liters NUMERIC(7, 2),
  started_on DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE water_quality_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aquarium_id UUID REFERENCES aquariums(id) ON DELETE CASCADE,
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

CREATE INDEX water_quality_logs_aquarium_measured_at_idx
  ON water_quality_logs (aquarium_id, measured_at DESC);

ALTER TABLE aquariums ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_quality_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public aquarium read" ON aquariums
  FOR SELECT USING (true);

CREATE POLICY "public water log read" ON water_quality_logs
  FOR SELECT USING (true);
