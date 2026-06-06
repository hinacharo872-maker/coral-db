-- Revocable Lite share links for shop consultation.
-- Anonymous table access is intentionally not granted; shared reads will use a
-- dedicated RPC that validates token status and expiry.

CREATE TABLE IF NOT EXISTS public.lite_shop_share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tank_id UUID NOT NULL
    REFERENCES public.lite_tank_profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  token TEXT NOT NULL UNIQUE,
  status public.lite_share_status NOT NULL DEFAULT 'active',
  expires_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_lite_shop_share_links_token
  ON public.lite_shop_share_links (token);

ALTER TABLE public.lite_shop_share_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users manage own lite shop share links"
  ON public.lite_shop_share_links;

DROP POLICY IF EXISTS "Users can manage own share links"
  ON public.lite_shop_share_links;

CREATE POLICY "Users can manage own share links"
  ON public.lite_shop_share_links
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.lite_shop_share_links
  TO authenticated;

COMMENT ON TABLE public.lite_shop_share_links IS
  'Owner-managed, revocable Lite record links for shop consultation.';

COMMENT ON COLUMN public.lite_shop_share_links.token IS
  'Must contain a cryptographically strong opaque token and must only be resolved through the validated share RPC.';
