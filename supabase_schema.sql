-- ============================================================
-- Airspace OS · Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable the uuid-ossp extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── flight_telemetry ─────────────────────────────────────────
-- Stores every telemetry ping pushed from a drone or simulator.
CREATE TABLE IF NOT EXISTS public.flight_telemetry (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  drone_id    TEXT        NOT NULL,
  latitude    FLOAT8      NOT NULL CHECK (latitude  BETWEEN -90  AND 90),
  longitude   FLOAT8      NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  altitude    FLOAT8      NOT NULL CHECK (altitude >= 0),
  timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast "latest position per drone" queries
CREATE INDEX IF NOT EXISTS idx_telemetry_drone_ts
  ON public.flight_telemetry (drone_id, timestamp DESC);

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE public.flight_telemetry ENABLE ROW LEVEL SECURITY;

-- Allow anyone with the anon key to INSERT telemetry (API endpoint)
CREATE POLICY "Allow public inserts"
  ON public.flight_telemetry FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anyone with the anon key to SELECT telemetry (dashboard map)
CREATE POLICY "Allow public reads"
  ON public.flight_telemetry FOR SELECT
  TO anon
  USING (true);

-- ── Realtime ─────────────────────────────────────────────────
-- Enable Supabase Realtime for live map updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.flight_telemetry;
