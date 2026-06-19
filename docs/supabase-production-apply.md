# Supabase Production Migration Apply

This document covers the production migrations for the optional ReefChart Lite
environment fields.

## Migration Status

| Migration | Production status |
| --- | --- |
| `20260618000100_add_lite_tank_environment.sql` | Applied and verified |
| `20260619000100_add_lite_tank_dimensions.sql` | Pending manual application |

Do not run the already-applied migration again. The next production operation
must apply only:

```text
supabase/migrations/20260619000100_add_lite_tank_dimensions.sql
```

## Pending Schema Changes

The pending migration adds these columns to `public.lite_tank_profiles`:

| Column | Type | Required |
| --- | --- | --- |
| `tank_width_cm` | `numeric(8,2)` | No, nullable |
| `tank_depth_cm` | `numeric(8,2)` | No, nullable |
| `tank_height_cm` | `numeric(8,2)` | No, nullable |

`tank_volume_liters` already exists and is reused. The migration also replaces
`public.get_lite_shared_environment(text)` so anonymous shared cards can return
the three dimensions and the existing actual-water-volume field.

All three new columns allow `NULL`. The migration does not update or delete
existing rows, enable or disable RLS, or add, replace, or remove an RLS policy.
Existing profiles therefore remain valid.

## Supabase Dashboard SQL Editor

### 1. Preflight

Open the production project `sfcykdqdiazrbrjptkkr`, then run:

```sql
select column_name, is_nullable, data_type, numeric_precision, numeric_scale
from information_schema.columns
where table_schema = 'public'
  and table_name = 'lite_tank_profiles'
  and column_name in (
    'tank_width_cm',
    'tank_depth_cm',
    'tank_height_cm',
    'tank_volume_liters'
  )
order by column_name;

select c.relname, c.relrowsecurity, c.relforcerowsecurity
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('lite_tank_profiles', 'lite_shop_share_links')
order by c.relname;

select tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('lite_tank_profiles', 'lite_shop_share_links')
order by tablename, policyname;
```

Save the RLS and policy results for comparison. Before application,
`tank_volume_liters` should exist and the three dimension columns should be
absent. If all three dimension columns already exist, stop and compare the live
RPC and constraints instead of running the migration again.

### 2. Apply The Migration

Open
`supabase/migrations/20260619000100_add_lite_tank_dimensions.sql`, copy its
complete unchanged contents, and run it as one transaction:

```sql
begin;

-- Paste the complete contents of
-- supabase/migrations/20260619000100_add_lite_tank_dimensions.sql here.

commit;
```

Do not include the older `20260618000100` migration, production row updates,
user IDs, access tokens, or service-role keys in this query.

### 3. Success Verification SQL

Verify column types and nullability:

```sql
select column_name, is_nullable, data_type, numeric_precision, numeric_scale
from information_schema.columns
where table_schema = 'public'
  and table_name = 'lite_tank_profiles'
  and column_name in (
    'tank_width_cm',
    'tank_depth_cm',
    'tank_height_cm',
    'tank_volume_liters'
  )
order by column_name;
```

This must return four rows. The three dimension columns must have
`is_nullable = 'YES'`, numeric precision `8`, and scale `2`.

Verify the positive-number constraints:

```sql
select conname, convalidated, pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.lite_tank_profiles'::regclass
  and conname in (
    'lite_tank_profiles_width_check',
    'lite_tank_profiles_depth_check',
    'lite_tank_profiles_height_check'
  )
order by conname;
```

This must return three validated constraints. Each definition must allow
`NULL` and reject values that are zero or less.

Verify the anonymous-share RPC and grants:

```sql
select
  p.oid::regprocedure as function_name,
  p.prosecdef as security_definer,
  p.provolatile as volatility,
  p.proacl as privileges,
  pg_get_functiondef(p.oid) as definition
from pg_proc p
where p.oid = 'public.get_lite_shared_environment(text)'::regprocedure;

select
  has_function_privilege(
    'anon',
    'public.get_lite_shared_environment(text)',
    'EXECUTE'
  ) as anon_can_execute,
  has_function_privilege(
    'authenticated',
    'public.get_lite_shared_environment(text)',
    'EXECUTE'
  ) as authenticated_can_execute;

select public.get_lite_shared_environment(
  'invalid-production-verification-token'
) as invalid_token_result;
```

The function must be security-definer, its definition must include all three
dimension columns and `tank_volume_liters`, both intended roles must have
execute permission, and an invalid token must return `null`.

Verify that RLS and policies are unchanged:

```sql
select c.relname, c.relrowsecurity, c.relforcerowsecurity
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('lite_tank_profiles', 'lite_shop_share_links')
order by c.relname;

select tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('lite_tank_profiles', 'lite_shop_share_links')
order by tablename, policyname;
```

Both tables must keep RLS enabled. Compare the policies with the preflight
result; this migration must not change them.

### 4. Failure Handling

If a statement fails before the transaction commits, run:

```sql
rollback;
```

Save the SQL Editor error and failed statement, then rerun the preflight and
success-verification queries. Do not work around an ownership or permission
error by disabling RLS or broadening table grants.

## Rollback Warning

Forward correction is preferred. Dropping the new columns permanently deletes
any dimensions users saved after application. Replacing the RPC with its
previous definition is also required; simply dropping the new columns would
leave the deployed function invalid.

Only after redeploying code that does not read the dimensions, exporting any
saved values, and obtaining explicit approval, use this rollback transaction:

```sql
begin;

drop function if exists public.get_lite_shared_environment(text);

alter table public.lite_tank_profiles
  drop constraint if exists lite_tank_profiles_width_check,
  drop constraint if exists lite_tank_profiles_depth_check,
  drop constraint if exists lite_tank_profiles_height_check,
  drop column if exists tank_width_cm,
  drop column if exists tank_depth_cm,
  drop column if exists tank_height_cm;

-- Restore get_lite_shared_environment(text) from
-- 20260618000100_add_lite_tank_environment.sql before committing.

commit;
```

Do not commit the rollback until the prior RPC definition has been restored.
The rollback does not change `tank_volume_liters` or existing RLS policies.

## Migration History

A Dashboard SQL Editor run does not automatically update Supabase CLI migration
history. After successful schema verification, record the manual run and later
reconcile it from an authenticated CLI environment:

```powershell
supabase migration repair 20260619000100 --status applied
supabase migration list
```

After applying the migration, complete the authenticated save, reload, shop
card, anonymous share, share revocation, and Lite main-five checks in
`docs/release-smoke-test.md`.
