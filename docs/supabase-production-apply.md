# Supabase Production Migration Apply

This document covers the production application of:

```text
supabase/migrations/20260618000100_add_lite_tank_environment.sql
```

Do not apply the migration from a machine that has not been given explicit
production access. The current Codex environment does not have a Supabase
Personal Access Token or database password, so production application remains
a manual operation.

## What The Migration Changes

The migration adds five nullable columns to `public.lite_tank_profiles`:

- `ph`
- `salt_mix_name`
- `lighting_equipment`
- `wave_pumps`
- `filtration_method`

It also adds value-shape constraints, column comments, and the
`public.get_lite_shared_environment(text)` function. It does not update or
delete existing rows, make a new field required, disable RLS, or replace the
existing owner policies.

## Production Review Summary

Apply exactly one migration:

```text
20260618000100_add_lite_tank_environment.sql
```

Expected schema changes:

| Object | Change |
| --- | --- |
| `lite_tank_profiles.ph` | Add nullable `numeric(4,2)` |
| `lite_tank_profiles.salt_mix_name` | Add nullable `text` |
| `lite_tank_profiles.lighting_equipment` | Add nullable `jsonb` array |
| `lite_tank_profiles.wave_pumps` | Add nullable `jsonb` array |
| `lite_tank_profiles.filtration_method` | Add nullable `text` |
| `get_lite_shared_environment(text)` | Create a token-validated, read-only JSON RPC |

The migration does not enable, disable, or force RLS and does not create,
replace, or drop an RLS policy. The existing owner policy on
`lite_tank_profiles` and owner policy on `lite_shop_share_links` remain the
authorities for direct table access. Anonymous access to the five new fields is
only granted through the new RPC after it validates an active, unexpired share
token.

## Dashboard SQL Editor Procedure

### 1. SQL To Run

First run this read-only preflight query:

```sql
select
  to_regclass('public.lite_tank_profiles') as profile_table,
  to_regclass('public.lite_shop_share_links') as share_link_table,
  to_regprocedure('public.get_lite_shared_environment(text)') as existing_rpc;

select column_name, is_nullable, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'lite_tank_profiles'
  and column_name in (
    'ph',
    'salt_mix_name',
    'lighting_equipment',
    'wave_pumps',
    'filtration_method'
  )
order by column_name;

select relrowsecurity
from pg_class
where oid = 'public.lite_tank_profiles'::regclass;

select tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('lite_tank_profiles', 'lite_shop_share_links')
order by tablename, policyname;
```

Before application, both tables must exist, `relrowsecurity` must be `true`,
and the new columns and RPC should be absent. If another operator has already
applied them, stop and compare the live definitions instead of running the
migration again.

For the actual change, open
`supabase/migrations/20260618000100_add_lite_tank_environment.sql`, copy its
complete contents, and run it as one explicit transaction:

```sql
begin;

-- Paste the complete, unchanged contents of
-- supabase/migrations/20260618000100_add_lite_tank_environment.sql here.

commit;
```

Do not paste another migration into the same query. Do not add a service-role
key, user ID, share token, or production row update to this SQL.

### 2. Execution Order

1. Confirm the Dashboard project reference is `sfcykdqdiazrbrjptkkr`.
2. Run the read-only preflight SQL and save its result.
3. Confirm the two dependency tables and their owner policies exist.
4. Run only `20260618000100_add_lite_tank_environment.sql` inside the explicit
   transaction above.
5. Run all success queries below.
6. Record the Dashboard execution and reconcile CLI migration history before a
   future `supabase db push`.
7. Only after schema verification, perform authenticated save, anonymous
   share, revocation, and cross-user RLS tests.

### 3. Success Verification SQL

Verify the five columns, types, and nullability:

```sql
select column_name, is_nullable, data_type, numeric_precision, numeric_scale
from information_schema.columns
where table_schema = 'public'
  and table_name = 'lite_tank_profiles'
  and column_name in (
    'ph',
    'salt_mix_name',
    'lighting_equipment',
    'wave_pumps',
    'filtration_method'
  )
order by column_name;
```

This must return five rows and every row must have `is_nullable = 'YES'`.
`ph` must report numeric precision `4` and scale `2`.

Verify all three constraints are present and validated:

```sql
select conname, convalidated, pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.lite_tank_profiles'::regclass
  and conname in (
    'lite_tank_profiles_ph_check',
    'lite_tank_profiles_lighting_equipment_check',
    'lite_tank_profiles_wave_pumps_check'
  )
order by conname;
```

Verify the RPC is security-definer and callable only through its grants:

```sql
select
  p.oid::regprocedure as function_name,
  p.prosecdef as security_definer,
  p.provolatile as volatility,
  p.proacl as privileges
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

The function must report `security_definer = true`, both intended roles must
have execute permission, and the invalid token result must be `null`.

Verify RLS and policies are still present after application:

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

Both tables must keep `relrowsecurity = true`. Compare the policy result with
the saved preflight result; this migration must not add, remove, or alter a
policy.

### 4. Failure Investigation

If any statement fails inside the explicit transaction, do not run `commit`
again. Run:

```sql
rollback;
```

Then rerun the preflight query and the success queries to determine whether the
live schema is unchanged or whether an earlier manual attempt had already left
objects behind. Common checks are:

```sql
select column_name, is_nullable, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'lite_tank_profiles'
  and column_name in (
    'ph',
    'salt_mix_name',
    'lighting_equipment',
    'wave_pumps',
    'filtration_method'
  )
order by column_name;

select to_regprocedure('public.get_lite_shared_environment(text)');
```

Save the SQL Editor error text and the statement that failed. Do not work
around an ownership, missing-table, or permission error by changing grants or
disabling RLS.

## Rollback

Forward correction is preferred because the added fields are nullable and do
not rewrite existing data. Schema rollback is destructive after users have
saved optional environment details.

Before dropping database objects:

1. Redeploy an application version from before commit `befbab6`, or otherwise
   remove all reads and writes of the five fields and RPC.
2. Confirm no production user has saved data in any new field, or export that
   data and obtain explicit approval to delete it.
3. Run the rollback in one transaction:

```sql
begin;

revoke all on function public.get_lite_shared_environment(text) from public;
revoke all on function public.get_lite_shared_environment(text)
  from anon, authenticated;
drop function if exists public.get_lite_shared_environment(text);

alter table public.lite_tank_profiles
  drop constraint if exists lite_tank_profiles_ph_check,
  drop constraint if exists lite_tank_profiles_lighting_equipment_check,
  drop constraint if exists lite_tank_profiles_wave_pumps_check,
  drop column if exists ph,
  drop column if exists salt_mix_name,
  drop column if exists lighting_equipment,
  drop column if exists wave_pumps,
  drop column if exists filtration_method;

commit;
```

This rollback permanently removes any values stored in the five columns. It
does not change the pre-existing RLS policies.

## Option A: Supabase CLI

### Required access

- Supabase CLI
- `SUPABASE_ACCESS_TOKEN` for an account with access to the project
- Production database password
- Project reference: `sfcykdqdiazrbrjptkkr`

Keep credentials out of the repository. In PowerShell, set them only in the
current process or an ignored local environment file.

```powershell
$env:SUPABASE_ACCESS_TOKEN = '<personal-access-token>'
$env:SUPABASE_DB_PASSWORD = '<production-database-password>'
```

Authenticate and link the local repository:

```powershell
supabase login --token $env:SUPABASE_ACCESS_TOKEN
supabase link --project-ref sfcykdqdiazrbrjptkkr --password $env:SUPABASE_DB_PASSWORD
supabase migration list
```

Preview pending migrations before applying them:

```powershell
supabase db push --dry-run
```

Confirm that only the expected migration is pending, then apply it:

```powershell
supabase db push
```

Do not use `--include-all` unless older unapplied migrations have been reviewed
separately.

## Dashboard Migration History Reconciliation

A Dashboard SQL Editor run does not automatically mark the local migration file
as applied in CLI history. Record the Dashboard execution in the team's
deployment notes. Before a later `db push`, link the CLI and reconcile it with:

```powershell
supabase migration repair 20260618000100 --status applied
supabase migration list
```

Do not execute the same migration blindly a second time. After schema
verification, run the authenticated save, anonymous share, revocation, and
cross-user RLS checks from `docs/release-smoke-test.md`.
