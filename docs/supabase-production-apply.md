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

## Option B: Supabase Dashboard SQL Editor

1. Sign in to the Supabase Dashboard and open project
   `sfcykdqdiazrbrjptkkr`.
2. Open **SQL Editor** and create a new query.
3. Open
   `supabase/migrations/20260618000100_add_lite_tank_environment.sql` locally.
4. Copy the complete SQL file into the editor without modifying table names,
   grants, or the token checks.
5. Review that the editor is connected to the production project.
6. Run the query once and retain the successful execution result.
7. Record the migration as applied in the team's deployment notes. A Dashboard
   SQL run does not automatically mark the local migration file as applied in
   CLI history. Before a later `db push`, link the CLI and reconcile it with:

   ```powershell
   supabase migration repair 20260618000100 --status applied
   ```

   Run `supabase migration list` afterward and do not execute the same migration
   blindly a second time.

## Verification Queries

Check that every new field remains nullable:

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
```

All five rows must report `is_nullable = 'YES'`.

Confirm RLS and owner policies remain present:

```sql
select relrowsecurity
from pg_class
where oid = 'public.lite_tank_profiles'::regclass;

select policyname, roles, cmd
from pg_policies
where schemaname = 'public'
  and tablename = 'lite_tank_profiles'
order by policyname;
```

`relrowsecurity` must be `true`, and the authenticated owner policy must still
be listed.

Confirm the shared-environment function exists:

```sql
select to_regprocedure('public.get_lite_shared_environment(text)');
```

After schema verification, run the authenticated save, anonymous share,
revocation, and cross-user RLS checks from `docs/release-smoke-test.md`.
