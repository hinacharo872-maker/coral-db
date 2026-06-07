-- Only reviewed additive effects may influence Lite routing.

ALTER TABLE public.additive_effects
  ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS verification_note TEXT,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS source_url TEXT;

UPDATE public.additive_effects effect
SET source_url = product.source_url
FROM public.additive_products product
WHERE product.id = effect.additive_id
  AND effect.source_url IS NULL;

-- Direct alkalinity products, clearly named balanced products, and
-- manufacturer-defined nutrient-control products are approved for matching.
UPDATE public.additive_effects
SET verified = TRUE,
    verified_at = COALESCE(verified_at, NOW()),
    verification_note = COALESCE(
      verification_note,
      'Product identity and stated purpose were reviewed against the existing catalog. Always show manufacturer guidance before use.'
    )
WHERE additive_id IN (
  'f51ddb9c-060c-4beb-afd9-96f252098f4f',
  'e26ce696-3db8-400e-a49d-58f61898696b',
  '1c2402d4-be75-4d21-9d9d-a6d3084d4ee5',
  '8c1401e1-9c32-4ccd-af88-b866c1b8ac9f',
  '96b41bb0-5fe3-4b77-bc76-4bb0fee05ff2',
  '309b2c9d-29fd-424f-b5dd-9e1159b11bcd',
  'a88b9a76-d2b1-4ddc-b829-f2398bb3acdf',
  '6af82cb7-f078-413a-b030-6b9c994e86e2',
  '3c610650-b4ef-45f2-95ff-b11a543bcc97',
  '0b549b17-e461-4480-aa53-87615a2bda38',
  '375c56ed-9a3a-4ee7-8abc-7f4c878896a0',
  '4652e9a2-51f3-4ce7-a7e3-32c8bd50a564',
  'e998adb1-81d1-4cd1-b288-0bd803b8e1b5',
  'aa5e8643-b018-4973-8af6-0f97ed5dcfad',
  'ebe0dc0e-99fe-4e1e-8137-da24f311b807',
  '3bf56edc-c0a4-4085-ac63-bbee05916b84',
  'fda30474-b316-413c-a437-433b80a34eab',
  '0af7189d-4941-40c3-a70e-e8edd3475072',
  '7a0a3828-99be-4016-bc0a-6c0a8c23932d',
  'bc24cdf3-bc87-4f6d-8357-6d146df8a27e',
  '66f08298-eb19-4f47-91e2-3ae5b87d863a',
  '8245a8b0-d28a-46ab-92e4-7c16f58f9bfb',
  '4cc9d1cd-cddb-4828-b68d-c6e1ea677f1f',
  'c269ac57-9542-4a14-9a40-ba2147dddcea',
  'f7d9525f-5837-494b-bbe9-030d31584100',
  'c118d0a9-8c6d-489c-b35a-8b131082899b'
);

-- These associations were seeded from broad catalog categories. Keep them
-- visible for review, but exclude them from routing until a source is checked.
UPDATE public.additive_effects
SET verified = FALSE,
    verified_at = NULL,
    verification_note = 'Pending review of manufacturer documentation before Lite routing may use this effect.'
WHERE additive_id IN (
  '0b077b3a-0a22-4ca1-94d5-80cd754d4eae',
  '6201e868-a1fd-4292-ab93-94bb7034697a'
);

CREATE INDEX IF NOT EXISTS additive_effects_verified_lookup_idx
  ON public.additive_effects (parameter_key, direction, additive_id)
  WHERE verified = TRUE;

COMMENT ON COLUMN public.additive_effects.verified IS
  'Only true rows may influence Lite owned-product or product routing.';
