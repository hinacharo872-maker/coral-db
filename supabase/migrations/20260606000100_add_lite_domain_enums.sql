-- Domain enums for the Lite aquarium record and shop-assistance workflow.
-- This migration only adds new types and does not modify existing tables.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'lite_tank_stage'
  ) THEN
    CREATE TYPE public.lite_tank_stage AS ENUM (
      'startup',
      'stable',
      'unknown'
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'lite_share_status'
  ) THEN
    CREATE TYPE public.lite_share_status AS ENUM (
      'active',
      'revoked',
      'expired'
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'lite_additive_frequency'
  ) THEN
    CREATE TYPE public.lite_additive_frequency AS ENUM (
      'daily',
      'every_2_days',
      'weekly',
      'as_needed',
      'unknown'
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'lite_recommendation_type'
  ) THEN
    CREATE TYPE public.lite_recommendation_type AS ENUM (
      'measure_missing',
      'use_owned_additive',
      'buy_test_kit',
      'buy_additive',
      'consult_shop',
      'consider_icp',
      'consider_pro',
      'no_action'
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'lite_severity'
  ) THEN
    CREATE TYPE public.lite_severity AS ENUM (
      'green',
      'yellow',
      'red',
      'unknown'
    );
  END IF;
END
$$;

COMMENT ON TYPE public.lite_tank_stage IS
  'Coarse Lite-stage label used to make a tank record easy for a shop to scan.';

COMMENT ON TYPE public.lite_share_status IS
  'Lifecycle state for a revocable, expiring Lite record share.';

COMMENT ON TYPE public.lite_additive_frequency IS
  'Simple additive frequency vocabulary intended for non-expert data entry.';

COMMENT ON TYPE public.lite_recommendation_type IS
  'Honest Lite routing outcome; advanced diagnosis and automation belong in Pro.';

COMMENT ON TYPE public.lite_severity IS
  'Human-readable traffic-light severity for the Lite record.';
