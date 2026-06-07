-- Honest routing requires product effects. These rows reference products that
-- were verified in the existing additive_products catalog on 2026-06-07.

CREATE UNIQUE INDEX IF NOT EXISTS additive_effects_product_parameter_direction_idx
  ON public.additive_effects (additive_id, parameter_key, direction);

INSERT INTO public.additive_effects (
  additive_id,
  parameter_key,
  direction,
  effect_group,
  note
)
SELECT
  seed.additive_id,
  seed.parameter_key::public.additive_parameter_key,
  seed.direction::public.additive_effect_direction,
  seed.effect_group,
  seed.note
FROM (
  VALUES
    ('f51ddb9c-060c-4beb-afd9-96f252098f4f'::UUID, 'kh', 'increase', 'alkalinity', 'Aquaforest KH Plus; catalog-verified alkalinity product.'),
    ('e26ce696-3db8-400e-a49d-58f61898696b'::UUID, 'kh', 'increase', 'alkalinity', 'Coral Power Carbonate + Trace; catalog-verified alkalinity product.'),
    ('1c2402d4-be75-4d21-9d9d-a6d3084d4ee5'::UUID, 'kh', 'increase', 'alkalinity', 'Fauna Marin Balling Light Carbonate-Mix.'),
    ('8c1401e1-9c32-4ccd-af88-b866c1b8ac9f'::UUID, 'kh', 'increase', 'alkalinity', 'Fauna Marin Elementals KH.'),
    ('96b41bb0-5fe3-4b77-bc76-4bb0fee05ff2'::UUID, 'kh', 'increase', 'balanced_major_elements', 'Fauna Marin Ready2Reef; multi-element product.'),
    ('309b2c9d-29fd-424f-b5dd-9e1159b11bcd'::UUID, 'kh', 'increase', 'balanced_major_elements', 'PolypLab One; multi-element product.'),
    ('a88b9a76-d2b1-4ddc-b829-f2398bb3acdf'::UUID, 'kh', 'increase', 'alkalinity', 'Red Sea KH Coralline Gro.'),
    ('6af82cb7-f078-413a-b030-6b9c994e86e2'::UUID, 'kh', 'increase', 'balanced_major_elements', 'Red Sea Reef Foundation ABC+; multi-element product.'),
    ('3c610650-b4ef-45f2-95ff-b11a543bcc97'::UUID, 'kh', 'increase', 'alkalinity', 'Red Sea Reef Foundation B KH/Alkalinity.'),
    ('0b549b17-e461-4480-aa53-87615a2bda38'::UUID, 'kh', 'increase', 'alkalinity', 'Seachem Reef Buffer.'),
    ('375c56ed-9a3a-4ee7-8abc-7f4c878896a0'::UUID, 'kh', 'increase', 'alkalinity', 'Seachem Reef Builder.'),
    ('4652e9a2-51f3-4ce7-a7e3-32c8bd50a564'::UUID, 'kh', 'increase', 'alkalinity', 'Seachem Reef Carbonate.'),
    ('e998adb1-81d1-4cd1-b288-0bd803b8e1b5'::UUID, 'kh', 'increase', 'alkalinity', 'Seachem Reef Fusion 2.'),
    ('aa5e8643-b018-4973-8af6-0f97ed5dcfad'::UUID, 'kh', 'increase', 'balanced_major_elements', 'Tropic Marin All-For-Reef; multi-element product.'),
    ('aa5e8643-b018-4973-8af6-0f97ed5dcfad'::UUID, 'ca', 'increase', 'balanced_major_elements', 'Tropic Marin All-For-Reef; multi-element product.'),
    ('aa5e8643-b018-4973-8af6-0f97ed5dcfad'::UUID, 'mg', 'increase', 'balanced_major_elements', 'Tropic Marin All-For-Reef; multi-element product.'),
    ('ebe0dc0e-99fe-4e1e-8137-da24f311b807'::UUID, 'kh', 'increase', 'balanced_major_elements', 'Tropic Marin All-For-Reef Powder; multi-element product.'),
    ('ebe0dc0e-99fe-4e1e-8137-da24f311b807'::UUID, 'ca', 'increase', 'balanced_major_elements', 'Tropic Marin All-For-Reef Powder; multi-element product.'),
    ('ebe0dc0e-99fe-4e1e-8137-da24f311b807'::UUID, 'mg', 'increase', 'balanced_major_elements', 'Tropic Marin All-For-Reef Powder; multi-element product.'),
    ('3bf56edc-c0a4-4085-ac63-bbee05916b84'::UUID, 'kh', 'increase', 'alkalinity', 'Tropic Marin Bio-Calcium; calcium and alkalinity product.'),
    ('fda30474-b316-413c-a437-433b80a34eab'::UUID, 'kh', 'increase', 'balanced_major_elements', 'Tropic Marin Carbo-Calcium.'),
    ('0af7189d-4941-40c3-a70e-e8edd3475072'::UUID, 'kh', 'increase', 'balanced_major_elements', 'Tropic Marin Carbo-Calcium Powder.'),
    ('7a0a3828-99be-4016-bc0a-6c0a8c23932d'::UUID, 'kh', 'increase', 'alkalinity', 'Tropic Marin Original Balling Part B.'),

    ('bc24cdf3-bc87-4f6d-8357-6d146df8a27e'::UUID, 'no3', 'decrease', 'nutrient_control', 'Aquaforest -NP Pro; nitrate/phosphate control.'),
    ('bc24cdf3-bc87-4f6d-8357-6d146df8a27e'::UUID, 'po4', 'decrease', 'nutrient_control', 'Aquaforest -NP Pro; nitrate/phosphate control.'),
    ('0b077b3a-0a22-4ca1-94d5-80cd754d4eae'::UUID, 'no3', 'decrease', 'nutrient_control', 'Coral Power BioControl; catalog category indicates nutrient control. Review manufacturer guidance before display.'),
    ('0b077b3a-0a22-4ca1-94d5-80cd754d4eae'::UUID, 'po4', 'decrease', 'nutrient_control', 'Coral Power BioControl; catalog category indicates nutrient control. Review manufacturer guidance before display.'),
    ('6201e868-a1fd-4292-ab93-94bb7034697a'::UUID, 'no3', 'decrease', 'bacteria_nutrient_control', 'Fauna Marin Bacto Blend; nutrient-control association. Review official usage before display.'),
    ('6201e868-a1fd-4292-ab93-94bb7034697a'::UUID, 'po4', 'decrease', 'bacteria_nutrient_control', 'Fauna Marin Bacto Blend; nutrient-control association. Review official usage before display.'),
    ('66f08298-eb19-4f47-91e2-3ae5b87d863a'::UUID, 'no3', 'decrease', 'carbon_dosing', 'Red Sea NO3:PO4-X.'),
    ('66f08298-eb19-4f47-91e2-3ae5b87d863a'::UUID, 'po4', 'decrease', 'carbon_dosing', 'Red Sea NO3:PO4-X.'),
    ('8245a8b0-d28a-46ab-92e4-7c16f58f9bfb'::UUID, 'no3', 'decrease', 'nutrient_control', 'Tropic Marin Elimi-NP.'),
    ('8245a8b0-d28a-46ab-92e4-7c16f58f9bfb'::UUID, 'po4', 'decrease', 'nutrient_control', 'Tropic Marin Elimi-NP.'),
    ('4cc9d1cd-cddb-4828-b68d-c6e1ea677f1f'::UUID, 'no3', 'decrease', 'nutrient_control', 'Tropic Marin NP-Bacto-Balance.'),
    ('4cc9d1cd-cddb-4828-b68d-c6e1ea677f1f'::UUID, 'po4', 'decrease', 'nutrient_control', 'Tropic Marin NP-Bacto-Balance.'),

    ('c269ac57-9542-4a14-9a40-ba2147dddcea'::UUID, 'bacteria', 'supplement', 'bacteria', 'Aquaforest Pro Bio S.'),
    ('f7d9525f-5837-494b-bbe9-030d31584100'::UUID, 'bacteria', 'supplement', 'bacteria', 'Coral Essentials Coral Power BioPro.'),
    ('6201e868-a1fd-4292-ab93-94bb7034697a'::UUID, 'bacteria', 'supplement', 'bacteria', 'Fauna Marin Bacto Blend.'),
    ('c118d0a9-8c6d-489c-b35a-8b131082899b'::UUID, 'bacteria', 'supplement', 'bacteria', 'PolypLab System Reef-resh RF-Genesis.')
) AS seed(additive_id, parameter_key, direction, effect_group, note)
JOIN public.additive_products product
  ON product.id = seed.additive_id
ON CONFLICT (additive_id, parameter_key, direction)
DO UPDATE SET
  effect_group = EXCLUDED.effect_group,
  note = EXCLUDED.note;

COMMENT ON INDEX public.additive_effects_product_parameter_direction_idx IS
  'Prevents duplicate honest-routing effects for the same product, parameter, and direction.';
