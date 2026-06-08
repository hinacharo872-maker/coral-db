# Coral DB Lite Release Security Checklist

Last updated: 2026-06-08

## Priority

The release gate is Supabase/RLS safety and share-link safety. Lite is for
beginners and older users, so accidental oversharing is treated as a product
risk, not only a technical risk.

## RLS Audit SQL

Migration `20260608000100_release_security_rls_audit.sql` adds an admin-only
RPC:

```sql
select *
from public.audit_public_rls_status()
order by rls_enabled asc, table_name asc;
```

Release reviewers should check:

- `rls_enabled` is `true` for every public schema table.
- Tables with user data have owner-only policies.
- Catalog tables with public reads have only intentional read policies.
- Share-link tables are not directly readable by anonymous users.
- Anonymous share access goes through `get_lite_shared_record()`.

To list only failures:

```sql
select *
from public.audit_public_rls_status()
where rls_enabled = false;
```

Local migration scan on 2026-06-08 found 32 public tables created by migrations
and 32 matching `ENABLE ROW LEVEL SECURITY` statements. Production should still
be checked with the RPC after deployment because live schema drift is possible.

## Expected Policy Shape

- `lite_tank_profiles`: owner manages own rows.
- `lite_measurements`: owner manages own rows.
- `lite_additive_usage`: owner manages own rows.
- `lite_tank_photos`: owner manages own rows.
- `lite_water_change_logs`: owner manages own rows.
- `lite_shop_share_links`: owner manages own rows; anonymous users never read
  the table directly.
- `lite_share_views`: direct access revoked; written through share RPC.
- `shop_feedback`: direct access revoked; written through feedback RPC.
- Additive product/catalog tables: public read only.
- Coral catalog tables: public read only unless wiki draft ownership applies.

## Share-Link Controls

- New share links must expire.
- UI allows only 24 hours or 7 days.
- Default is 24 hours.
- Existing no-expiry links can still be read for compatibility, but the UI
  labels them as old links and does not offer that option for new links.
- Database migration adds a forward-only insert trigger so new active rows
  require `expires_at` without breaking old no-expiry link reads.
- Shared reads validate token status and expiry in `get_lite_shared_record()`.
- Revoked and expired links do not return tank data.

## Service Role Exposure

Checked source paths with:

```bash
rg -n "SERVICE_ROLE|service_role|SUPABASE_SERVICE|NEXT_PUBLIC_SUPABASE|createClient\(" .
```

Current source only uses:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

No service role key is referenced in client code. Vercel and local environment
settings still need manual review before release to ensure no service role key
is configured with a `NEXT_PUBLIC_` prefix.

## Remaining Manual Checks

- Run the RLS audit RPC in production as an app admin.
- Confirm Supabase Storage buckets for tank photos are private before production
  photo uploads are enabled.
- Confirm OAuth and magic-link redirect URLs point to production domains.
- Confirm old no-expiry share links are reviewed and stopped if not needed.
- Confirm admins cannot accidentally expose private Lite records through future
  analytics screens.
