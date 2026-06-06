-- Product-purpose groups allow equivalent additive products to be compared
-- without losing their brand-specific identity or official dosing guidance.

CREATE TABLE IF NOT EXISTS public.additive_product_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  parameter_key public.additive_parameter_key,
  direction public.additive_effect_direction
);

CREATE TABLE IF NOT EXISTS public.additive_product_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL
    REFERENCES public.additive_product_groups(id)
    ON DELETE CASCADE,
  additive_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_additive_product_group_members_group_id
  ON public.additive_product_group_members (group_id);

CREATE INDEX IF NOT EXISTS idx_additive_product_group_members_additive_id
  ON public.additive_product_group_members (additive_id);

ALTER TABLE public.additive_product_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.additive_product_group_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public additive product groups read"
  ON public.additive_product_groups;

CREATE POLICY "public additive product groups read"
  ON public.additive_product_groups
  FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "public additive product group members read"
  ON public.additive_product_group_members;

CREATE POLICY "public additive product group members read"
  ON public.additive_product_group_members
  FOR SELECT
  USING (TRUE);

GRANT SELECT
  ON public.additive_product_groups
  TO anon, authenticated;

GRANT SELECT
  ON public.additive_product_group_members
  TO anon, authenticated;

COMMENT ON TABLE public.additive_product_groups IS
  'Publicly readable functional groups for comparing additive products with similar purposes.';

COMMENT ON COLUMN public.additive_product_groups.group_key IS
  'Stable application-facing identifier for an additive product group.';

COMMENT ON TABLE public.additive_product_group_members IS
  'Membership links between functional product groups and independently managed additive products.';

COMMENT ON COLUMN public.additive_product_group_members.additive_id IS
  'Additive product identifier kept without a foreign key until the authoritative additive catalog is finalized.';
