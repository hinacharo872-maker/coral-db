-- Track commercial additive dosing per user and aquarium.

CREATE TABLE IF NOT EXISTS public.additive_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  default_unit TEXT NOT NULL DEFAULT 'ml',
  source_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (brand, name)
);

CREATE TABLE IF NOT EXISTS public.additive_dose_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  aquarium_id UUID NOT NULL REFERENCES public.aquariums(id) ON DELETE CASCADE,
  additive_product_id UUID NOT NULL REFERENCES public.additive_products(id) ON DELETE RESTRICT,
  dosed_at DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC(8, 3) NOT NULL CHECK (amount >= 0),
  unit TEXT NOT NULL DEFAULT 'ml',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS additive_dose_logs_user_date_idx
  ON public.additive_dose_logs (user_id, dosed_at DESC);

CREATE INDEX IF NOT EXISTS additive_dose_logs_aquarium_product_idx
  ON public.additive_dose_logs (aquarium_id, additive_product_id, dosed_at DESC);

INSERT INTO public.additive_products (brand, name, category, default_unit, source_url, sort_order)
VALUES
  ('Tropic Marin', 'All-For-Reef', 'All-in-one Ca/KH/Mg/trace', 'ml', 'https://www.tropic-marin-smartinfo.com/?lang=en', 10),
  ('Red Sea', 'Reef Foundation A Calcium+', 'Calcium', 'ml', 'https://g1.redseafish.com/reef-care-program/reef_foundation_program/', 20),
  ('Red Sea', 'Reef Foundation B KH/Alkalinity', 'Alkalinity', 'ml', 'https://g1.redseafish.com/reef-care-program/reef_foundation_program/', 21),
  ('Red Sea', 'Reef Foundation C Magnesium', 'Magnesium', 'ml', 'https://g1.redseafish.com/reef-care-program/reef_foundation_program/', 22),
  ('Seachem', 'Reef Fusion 1', 'Calcium', 'ml', 'https://www.seachem.com/reef-fusion.php', 30),
  ('Seachem', 'Reef Fusion 2', 'Alkalinity', 'ml', 'https://www.seachem.com/reef-fusion.php', 31),
  ('Aquaforest', 'Component 1+', 'Balling component', 'ml', 'https://aquaforest.eu/en/knowledge-base-tag/component-123/', 40),
  ('Aquaforest', 'Component 2+', 'Balling component', 'ml', 'https://aquaforest.eu/en/knowledge-base-tag/component-123/', 41),
  ('Aquaforest', 'Component 3+', 'Balling component', 'ml', 'https://aquaforest.eu/en/knowledge-base-tag/component-123/', 42),
  ('Generic', 'Kalkwasser', 'Calcium hydroxide', 'ml', NULL, 90)
ON CONFLICT (brand, name) DO UPDATE SET
  category = EXCLUDED.category,
  default_unit = EXCLUDED.default_unit,
  source_url = EXCLUDED.source_url,
  sort_order = EXCLUDED.sort_order;

ALTER TABLE public.additive_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.additive_dose_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public additive products read" ON public.additive_products;
DROP POLICY IF EXISTS "users manage own additive doses" ON public.additive_dose_logs;

CREATE POLICY "public additive products read" ON public.additive_products
  FOR SELECT USING (true);

CREATE POLICY "users manage own additive doses" ON public.additive_dose_logs
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.aquariums aquarium
      WHERE aquarium.id = additive_dose_logs.aquarium_id
        AND aquarium.user_id = auth.uid()
    )
  );
