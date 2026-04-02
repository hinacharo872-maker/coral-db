-- ========================================
-- World Coral Database — Supabase セットアップ
-- ========================================

-- テーブル作成
CREATE TABLE corals (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scientific_name  TEXT NOT NULL,           -- 学名
  common_name_en   TEXT,                    -- 英語通称
  common_name_ja   TEXT,                    -- 日本語通称
  family           TEXT,                    -- 科名
  genus            TEXT,                    -- 属名
  origin_region    TEXT,                    -- 原産地域（短く）
  distribution     TEXT,                    -- 分布詳細
  water_temp_min   DECIMAL(4,1),            -- 最低水温 °C
  water_temp_max   DECIMAL(4,1),            -- 最高水温 °C
  salinity_min     DECIMAL(4,1),            -- 最低塩分濃度 ppt
  salinity_max     DECIMAL(4,1),            -- 最高塩分濃度 ppt
  ph_min           DECIMAL(3,1),            -- 最低pH
  ph_max           DECIMAL(3,1),            -- 最高pH
  light_intensity  TEXT,                    -- low / medium / high / very_high
  flow             TEXT,                    -- low / medium / high
  difficulty       TEXT,                    -- beginner / intermediate / advanced
  coral_type       TEXT,                    -- SPS / LPS / soft
  description      TEXT,                    -- 説明（多言語可）
  care_notes       TEXT,                    -- 飼育メモ
  image_url        TEXT,                    -- 画像URL
  contributed_by   TEXT,                    -- 登録者名
  country          TEXT,                    -- 登録者の国
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- セキュリティ設定（全員が閲覧可能、編集は管理者のみ）
ALTER TABLE corals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "全員が閲覧可能" ON corals
  FOR SELECT USING (true);

-- ========================================
-- サンプルデータ
-- ========================================

INSERT INTO corals (
  scientific_name, common_name_en, common_name_ja,
  family, genus, origin_region, distribution,
  water_temp_min, water_temp_max,
  salinity_min, salinity_max,
  ph_min, ph_max,
  light_intensity, flow, difficulty, coral_type,
  description, care_notes,
  contributed_by, country
) VALUES

-- SPS コーラル
(
  'Acropora millepora', 'Staghorn Coral', 'スタグホーンコーラル',
  'Acroporidae', 'Acropora', 'Indo-Pacific',
  'インド洋・太平洋の熱帯域のサンゴ礁',
  22, 28, 33, 35, 8.1, 8.4,
  'very_high', 'high', 'advanced', 'SPS',
  '最も代表的な造礁サンゴの一つ。枝状の骨格が特徴で、健全な礁を形成する重要な種。色彩は青・緑・ピンクなど多様。',
  '水質に非常に敏感。硝酸塩は5ppm以下、リン酸塩は0.03ppm以下を維持すること。カルシウム（420ppm）・アルカリ度（8.5dkH）の安定が重要。',
  'Admin', 'Japan'
),
(
  'Pocillopora damicornis', 'Cauliflower Coral', 'カリフラワーコーラル',
  'Pocilloporidae', 'Pocillopora', 'Indo-Pacific',
  'インド洋・太平洋の広域に分布',
  22, 28, 33, 35, 8.1, 8.4,
  'high', 'medium', 'intermediate', 'SPS',
  'SPSの中では比較的丈夫で育てやすい種。ピンク・茶・緑などの色彩を持つ。小さな瘤状の突起が密集した独特の形状。',
  '強い光と適度な水流を好む。定期的なフラギング（断片化）で増殖可能。',
  'Admin', 'Japan'
),
(
  'Stylophora pistillata', 'Cat''s Paw Coral', 'スタイロフォラ',
  'Pocilloporidae', 'Stylophora', 'Indo-Pacific',
  'インド洋・紅海・太平洋',
  23, 28, 33, 35, 8.1, 8.4,
  'high', 'medium', 'intermediate', 'SPS',
  '枝の先端が丸みを帯びた独特の形状。ピンク・紫・緑など鮮やかな色彩。成長は比較的早い。',
  NULL,
  'Admin', 'Australia'
),

-- LPS コーラル
(
  'Euphyllia ancora', 'Hammer Coral', 'ハンマーコーラル',
  'Euphylliidae', 'Euphyllia', 'Indo-Pacific',
  'インド洋・西太平洋',
  23, 27, 33, 35, 8.1, 8.3,
  'medium', 'low', 'beginner', 'LPS',
  'ハンマー状またはアンカー状のポリプが特徴的なLPSコーラル。グリーン・タン・ゴールドなど多彩な色彩。初心者にも人気の種。',
  '光は中程度で十分。隣接するサンゴに触れないよう配置に注意。スイーパー触手が伸びる場合がある。',
  'Admin', 'Japan'
),
(
  'Lobophyllia hemprichii', 'Brain Coral', 'ブレインコーラル',
  'Lobophylliidae', 'Lobophyllia', 'Indo-Pacific',
  'インド洋・太平洋のサンゴ礁',
  22, 28, 33, 35, 8.1, 8.3,
  'medium', 'low', 'beginner', 'LPS',
  '大きく波打った形状が脳を連想させる大型LPSコーラル。赤・オレンジ・緑・茶など多彩。飼育しやすく長寿命。',
  '週1〜2回の肉食給餌（小型エビや魚肉）で成長が促進される。',
  'Admin', 'Japan'
),
(
  'Blastomussa wellsi', 'Blastomussa', 'ブラストムッサ',
  'Mussidae', 'Blastomussa', 'Indo-Pacific',
  'インド洋・西太平洋',
  23, 27, 33, 35, 8.1, 8.3,
  'low', 'low', 'beginner', 'LPS',
  '比較的小型の円形ポリプが群体をなすLPSコーラル。赤・緑・茶の鮮やかな色彩。低光量でも育つ珍しい種。',
  '低光量・低水流でも飼育可能。初心者に最適。週1回程度の給餌で良好な成長。',
  'Admin', 'USA'
),

-- ソフトコーラル
(
  'Sinularia flexibilis', 'Flexible Leather Coral', 'シヌラリア',
  'Alcyoniidae', 'Sinularia', 'Indo-Pacific',
  'インド洋・太平洋のサンゴ礁',
  22, 28, 32, 35, 8.1, 8.4,
  'medium', 'medium', 'beginner', 'soft',
  '皮革のような質感のソフトコーラル。クリーム・タン・グリーンの色彩。成長が早く丈夫。テルペンと呼ばれる化学物質を分泌し周囲のサンゴに影響を与えることがある。',
  '活性炭の使用で分泌物の影響を軽減できる。成長が旺盛なため定期的にトリミングが必要。',
  'Admin', 'Australia'
),
(
  'Discosoma sp.', 'Mushroom Coral', 'マッシュルームコーラル',
  'Discosomatidae', 'Discosoma', 'Indo-Pacific',
  '熱帯・亜熱帯の世界各地のサンゴ礁',
  22, 28, 32, 35, 8.0, 8.4,
  'low', 'low', 'beginner', 'soft',
  'キノコのような円形の形状が特徴。色彩・模様の多様性が非常に高く、青・赤・緑・ピンクなど無数のバリエーションが存在。',
  '低光量・低水流でも育つ最も飼育しやすいサンゴの一つ。初心者に強くおすすめ。',
  'Admin', 'Japan'
),
(
  'Zoanthus sp.', 'Zoanthid', 'ゾアンサス（ズーア）',
  'Zoanthidae', 'Zoanthus', 'Worldwide',
  '世界中の熱帯・亜熱帯のサンゴ礁',
  22, 28, 33, 35, 8.0, 8.4,
  'medium', 'medium', 'beginner', 'soft',
  '小さな花のようなポリプが群体をなすソフトコーラル。色彩の多様性が非常に高く、コレクターに人気。コリタゾールという毒素を含む種があるため取り扱いに注意。',
  '定期的な清掃で汚れを除去すること。他のサンゴを侵食することがあるので配置に注意。',
  'Admin', 'Japan'
);
