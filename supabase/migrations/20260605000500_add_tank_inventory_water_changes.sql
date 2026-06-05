-- Add tank volume, owned additive inventory, and water change tracking.

ALTER TABLE public.aquariums
  ADD COLUMN IF NOT EXISTS volume_liters NUMERIC(8, 2);

ALTER TABLE public.additive_dose_logs
  ADD COLUMN IF NOT EXISTS additive_inventory_id UUID;

CREATE TABLE IF NOT EXISTS public.additive_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  aquarium_id UUID NOT NULL REFERENCES public.aquariums(id) ON DELETE CASCADE,
  additive_product_id UUID NOT NULL REFERENCES public.additive_products(id) ON DELETE RESTRICT,
  opened_at DATE DEFAULT CURRENT_DATE,
  initial_amount NUMERIC(10, 3) NOT NULL CHECK (initial_amount >= 0),
  remaining_amount NUMERIC(10, 3) NOT NULL CHECK (remaining_amount >= 0),
  unit TEXT NOT NULL DEFAULT 'ml',
  low_stock_threshold NUMERIC(10, 3) NOT NULL DEFAULT 50 CHECK (low_stock_threshold >= 0),
  notes TEXT,
  archived_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.water_change_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  aquarium_id UUID NOT NULL REFERENCES public.aquariums(id) ON DELETE CASCADE,
  changed_at DATE NOT NULL DEFAULT CURRENT_DATE,
  amount_liters NUMERIC(8, 2) NOT NULL CHECK (amount_liters > 0),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'additive_dose_logs_inventory_fk'
  ) THEN
    ALTER TABLE public.additive_dose_logs
      ADD CONSTRAINT additive_dose_logs_inventory_fk
      FOREIGN KEY (additive_inventory_id)
      REFERENCES public.additive_inventory(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS additive_inventory_user_aquarium_idx
  ON public.additive_inventory (user_id, aquarium_id, archived_at);

CREATE INDEX IF NOT EXISTS additive_inventory_product_idx
  ON public.additive_inventory (additive_product_id);

CREATE INDEX IF NOT EXISTS water_change_logs_user_date_idx
  ON public.water_change_logs (user_id, changed_at DESC);

CREATE INDEX IF NOT EXISTS water_change_logs_aquarium_date_idx
  ON public.water_change_logs (aquarium_id, changed_at DESC);

ALTER TABLE public.additive_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_change_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users manage own additive inventory" ON public.additive_inventory;
DROP POLICY IF EXISTS "users manage own water changes" ON public.water_change_logs;

CREATE POLICY "users manage own additive inventory" ON public.additive_inventory
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.aquariums aquarium
      WHERE aquarium.id = additive_inventory.aquarium_id
        AND aquarium.user_id = auth.uid()
    )
  );

CREATE POLICY "users manage own water changes" ON public.water_change_logs
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.aquariums aquarium
      WHERE aquarium.id = water_change_logs.aquarium_id
        AND aquarium.user_id = auth.uid()
    )
  );

INSERT INTO public.additive_products (brand, name, category, default_unit, source_url, sort_order)
VALUES
  ('LIVE SEA', 'Blend Iodine Jr', 'Iodine', 'ml', 'https://marinelovers.com/2021/05/25/softcoraltennkazai/', 700),
  ('LIVE SEA', 'Blend Iodine', 'Iodine', 'ml', 'https://marinelovers.com/2021/05/25/softcoraltennkazai/', 701),

  ('Coral Essentials', 'Coral Power Calcium + Trace', 'Calcium / trace', 'ml', 'https://www.coralessentials.com.au/products.html', 800),
  ('Coral Essentials', 'Coral Power Carbonate + Trace', 'Alkalinity / trace', 'ml', 'https://www.coralessentials.com.au/products.html', 801),
  ('Coral Essentials', 'Coral Power Magnesium + Trace', 'Magnesium / trace', 'ml', 'https://www.coralessentials.com.au/products.html', 802),
  ('Coral Essentials', 'Coral Power Trace A', 'Trace elements', 'ml', 'https://www.coralessentials.com.au/products.html', 810),
  ('Coral Essentials', 'Coral Power Trace B', 'Trace elements', 'ml', 'https://www.coralessentials.com.au/products.html', 811),
  ('Coral Essentials', 'Coral Power Trace C', 'Trace elements', 'ml', 'https://www.coralessentials.com.au/products.html', 812),
  ('Coral Essentials', 'Coral Power Gro Ready', 'Coral growth', 'ml', 'https://www.coralessentials.com.au/products.html', 820),
  ('Coral Essentials', 'Coral Power Gro', 'Coral growth', 'drop', 'https://www.coralessentials.com.au/products.html', 821),
  ('Coral Essentials', 'Coral Power Amino Ready', 'Amino acids', 'ml', 'https://www.coralessentials.com.au/products.html', 822),
  ('Coral Essentials', 'Coral Power Amino', 'Amino acids', 'drop', 'https://www.coralessentials.com.au/products.html', 823),
  ('Coral Essentials', 'Coral Power Nitrate Up', 'Nitrate supplement', 'ml', 'https://www.coralessentials.com.au/products.html', 830),
  ('Coral Essentials', 'Coral Power Phosphate Up', 'Phosphate supplement', 'ml', 'https://www.coralessentials.com.au/products.html', 831),
  ('Coral Essentials', 'Coral Power Strontium', 'Strontium', 'ml', 'https://www.coralessentials.com.au/products.html', 840),
  ('Coral Essentials', 'Coral Power Boron', 'Boron', 'ml', 'https://www.coralessentials.com.au/products.html', 841),
  ('Coral Essentials', 'Coral Power Bromide', 'Bromide', 'ml', 'https://www.coralessentials.com.au/products.html', 842),
  ('Coral Essentials', 'Coral Power Iron', 'Iron', 'ml', 'https://www.coralessentials.com.au/products.html', 843),
  ('Coral Essentials', 'Coral Power Potassium', 'Potassium', 'ml', 'https://www.coralessentials.com.au/products.html', 844),
  ('Coral Essentials', 'Coral Power Iodine', 'Iodine', 'ml', 'https://www.coralessentials.com.au/products.html', 845),
  ('Coral Essentials', 'Coral Power Fluoride', 'Fluoride', 'ml', 'https://www.coralessentials.com.au/products.html', 846),
  ('Coral Essentials', 'Coral Power Lithium', 'Lithium', 'ml', 'https://www.coralessentials.com.au/products.html', 847),
  ('Coral Essentials', 'Coral Power Manganese', 'Manganese', 'ml', 'https://www.coralessentials.com.au/products.html', 848),
  ('Coral Essentials', 'Coral Power Food', 'Coral food', 'ml', 'https://www.coralessentials.com.au/products.html', 860),
  ('Coral Essentials', 'Chroma+', 'Color / nutrition', 'ml', 'https://www.coralessentials.com.au/products.html', 861),
  ('Coral Essentials', 'Vibrance+', 'Color / vitality', 'ml', 'https://www.coralessentials.com.au/products.html', 862),
  ('Coral Essentials', 'Energy+', 'Coral nutrition', 'ml', 'https://www.coralessentials.com.au/products.html', 863),
  ('Coral Essentials', 'CVE+', 'Coral nutrition', 'ml', 'https://www.coralessentials.com.au/products.html', 864),
  ('Coral Essentials', 'Coral Power BioPro', 'Bacteria / probiotic', 'ml', 'https://www.coralessentials.com.au/products.html', 865),
  ('Coral Essentials', 'Coral Power BioControl', 'Nutrient control', 'ml', 'https://www.coralessentials.com.au/products.html', 866)
ON CONFLICT (brand, name) DO UPDATE SET
  category = EXCLUDED.category,
  default_unit = EXCLUDED.default_unit,
  source_url = EXCLUDED.source_url,
  sort_order = EXCLUDED.sort_order;
