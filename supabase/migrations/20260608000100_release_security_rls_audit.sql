-- Release security audit helpers and a forward-only guard for new Lite shares.

ALTER TABLE public.lite_shop_share_links
  DROP CONSTRAINT IF EXISTS lite_shop_share_links_active_requires_expiry;

CREATE OR REPLACE FUNCTION public.enforce_lite_share_expiry_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.status = 'active' AND NEW.expires_at IS NULL THEN
    RAISE EXCEPTION 'New active Lite share links must expire';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS lite_share_expiry_on_insert
  ON public.lite_shop_share_links;

CREATE TRIGGER lite_share_expiry_on_insert
  BEFORE INSERT ON public.lite_shop_share_links
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_lite_share_expiry_on_insert();

CREATE OR REPLACE FUNCTION public.audit_public_rls_status()
RETURNS TABLE (
  schema_name TEXT,
  table_name TEXT,
  rls_enabled BOOLEAN,
  rls_forced BOOLEAN,
  policy_count BIGINT,
  select_policy_count BIGINT,
  insert_policy_count BIGINT,
  update_policy_count BIGINT,
  delete_policy_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_app_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  RETURN QUERY
  SELECT
    namespace.nspname::TEXT AS schema_name,
    class.relname::TEXT AS table_name,
    class.relrowsecurity AS rls_enabled,
    class.relforcerowsecurity AS rls_forced,
    COUNT(policy.policyname)::BIGINT AS policy_count,
    COUNT(*) FILTER (WHERE policy.cmd IN ('SELECT', 'ALL'))::BIGINT AS select_policy_count,
    COUNT(*) FILTER (WHERE policy.cmd IN ('INSERT', 'ALL'))::BIGINT AS insert_policy_count,
    COUNT(*) FILTER (WHERE policy.cmd IN ('UPDATE', 'ALL'))::BIGINT AS update_policy_count,
    COUNT(*) FILTER (WHERE policy.cmd IN ('DELETE', 'ALL'))::BIGINT AS delete_policy_count
  FROM pg_catalog.pg_class class
  JOIN pg_catalog.pg_namespace namespace
    ON namespace.oid = class.relnamespace
  LEFT JOIN pg_catalog.pg_policies policy
    ON policy.schemaname = namespace.nspname
   AND policy.tablename = class.relname
  WHERE namespace.nspname = 'public'
    AND class.relkind IN ('r', 'p')
  GROUP BY namespace.nspname, class.relname, class.relrowsecurity, class.relforcerowsecurity
  ORDER BY class.relrowsecurity ASC, class.relname ASC;
END;
$$;

REVOKE ALL ON FUNCTION public.audit_public_rls_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.audit_public_rls_status() TO authenticated;

COMMENT ON FUNCTION public.audit_public_rls_status() IS
  'Admin-only release audit of public schema table RLS and policy coverage.';

COMMENT ON FUNCTION public.enforce_lite_share_expiry_on_insert() IS
  'Prevents new active Lite share links without an expiry while preserving old no-expiry link compatibility.';
