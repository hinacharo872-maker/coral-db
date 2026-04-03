-- ========================================
-- 追加サンゴデータ（33種）
-- supabase SQL Editorで実行してください
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

-- ===== SPS =====
(
  'Acropora tenuis', 'Green Branching Acropora', 'グリーンアクロポラ',
  'Acroporidae', 'Acropora', 'Indo-Pacific',
  'インド洋・太平洋の熱帯サンゴ礁',
  23, 27, 33, 35, 8.1, 8.4,
  'very_high', 'high', 'advanced', 'SPS',
  '細い枝が密集する小型ポリプ系SPSコーラル。グリーン・イエロー・ブルーなど色彩が多彩。健康な水質の指標となる種。',
  'カルシウム420ppm・アルカリ度9dkH・硝酸塩5ppm以下を維持。強い照明と水流が必須。',
  'Admin', 'Japan'
),
(
  'Acropora cerealis', 'Acropora cerealis', 'アクロポラ・セレアリス',
  'Acroporidae', 'Acropora', 'Indo-Pacific',
  'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.4,
  'very_high', 'high', 'advanced', 'SPS',
  'コロニー形成型のアクロポラ。紫・青・緑系の色彩が美しく、上級者に人気のSPS。',
  '水質への要求が非常に高い。定期的なALK・Ca・Mgの測定と補充が必須。',
  'Admin', 'Japan'
),
(
  'Acropora formosa', 'Table Acropora', 'テーブルアクロポラ',
  'Acroporidae', 'Acropora', 'Indo-Pacific',
  'インド洋・太平洋のサンゴ礁',
  23, 27, 33, 35, 8.1, 8.4,
  'very_high', 'high', 'advanced', 'SPS',
  'テーブル状に水平に広がる大型アクロポラ。水槽の主役になれる存在感のある種。成長すると迫力の景観を作る。',
  '大型水槽向き。光が均一に当たるよう配置を工夫すること。成長が早いため定期的なトリミングが必要。',
  'Admin', 'Australia'
),
(
  'Montipora capricornis', 'Plating Montipora', 'プレートモンティポーラ',
  'Acroporidae', 'Montipora', 'Indo-Pacific',
  'インド洋・太平洋',
  22, 28, 33, 35, 8.1, 8.4,
  'high', 'medium', 'intermediate', 'SPS',
  '薄い板状に横広がりに成長するモンティポーラ。赤・オレンジ・紫など鮮やかな色彩。SPSの中では比較的育てやすい入門種。',
  'アクロポラより水質の要求が低い。中程度の光と水流で管理。デトリタスが溜まらないよう水流を調整。',
  'Admin', 'Japan'
),
(
  'Montipora undata', 'Rice Coral', 'ライスコーラル',
  'Acroporidae', 'Montipora', 'Indo-Pacific',
  'インド洋・太平洋',
  22, 28, 33, 35, 8.1, 8.4,
  'high', 'medium', 'intermediate', 'SPS',
  '波打つ板状の形状が特徴的なモンティポーラ。ライスのような小さな突起が表面を覆う。グリーン・パープル系が多い。',
  'モンティポーラの中でも成長が旺盛。週1回の水換えで安定した成長を確保できる。',
  'Admin', 'USA'
),
(
  'Seriatopora hystrix', 'Birdsnest Coral', 'バードネストコーラル',
  'Pocilloporidae', 'Seriatopora', 'Indo-Pacific',
  'インド洋・紅海・東アフリカ・太平洋',
  23, 27, 33, 35, 8.1, 8.4,
  'high', 'high', 'intermediate', 'SPS',
  '鳥の巣のように細い枝が複雑に絡み合うSPSコーラル。ピンク・イエロー・グリーンが人気カラー。成長は比較的早い。',
  '強い水流で枝が折れることがあるため配置に注意。硝酸塩は10ppm以下を目標に。',
  'Admin', 'Japan'
),
(
  'Hydnophora rigida', 'Velvet Horn Coral', 'ベルベットホーンコーラル',
  'Merulinidae', 'Hydnophora', 'Indo-Pacific',
  'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.4,
  'high', 'high', 'advanced', 'SPS',
  'イボ状の突起が密生するユニークな外観のSPSコーラル。グリーン・タン系が多い。攻撃性が高く周囲のサンゴを傷つける。',
  '他のサンゴから十分な距離を置いて配置すること。スイーパー触手を出すため隣接禁止。',
  'Admin', 'Australia'
),
(
  'Turbinaria reniformis', 'Yellow Scroll Coral', 'イエロースクロールコーラル',
  'Dendrophylliidae', 'Turbinaria', 'Indo-Pacific',
  'インド洋・太平洋・紅海',
  22, 27, 33, 35, 8.1, 8.4,
  'medium', 'medium', 'intermediate', 'SPS',
  '渦巻き状・ひだ状に成長する独特の形状。イエロー〜グリーン系の色彩が多く、観賞価値が高い。',
  'デトリタスが溜まりやすいため定期的に清掃が必要。中程度の光と水流で管理。',
  'Admin', 'Japan'
),
(
  'Pavona cactus', 'Cactus Coral', 'サボテンコーラル',
  'Agariciidae', 'Pavona', 'Indo-Pacific',
  'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.4,
  'high', 'high', 'intermediate', 'SPS',
  'サボテンのようなギザギザした縦板状の骨格が特徴的。グリーン・ブラウン系の色彩。成長すると存在感のある景観を作る。',
  '水流を好む。強い水流と高照度で良好な成長。近隣サンゴに接触しないよう配置に注意。',
  'Admin', 'Australia'
),

-- ===== LPS =====
(
  'Trachyphyllia geoffroyi', 'Open Brain Coral', 'オープンブレインコーラル',
  'Merulinidae', 'Trachyphyllia', 'Indo-Pacific',
  'インド洋・太平洋のサンゴ礁',
  22, 27, 33, 35, 8.1, 8.3,
  'medium', 'low', 'intermediate', 'LPS',
  '脳のように曲がりくねった溝を持つ大型LPS。昼間は大きくポリプを膨らませる。赤・グリーン・マルチカラーなど色彩が豊富。',
  '砂底に置いて飼育するのが一般的。週1〜2回の給餌で色彩と成長が向上する。',
  'Admin', 'Japan'
),
(
  'Micromussa lordhowensis', 'Acan Lord Coral', 'アカンロードコーラル',
  'Merulinidae', 'Micromussa', 'Indo-Pacific',
  'インド洋・西太平洋・ロードハウ島',
  22, 27, 33, 35, 8.1, 8.3,
  'low', 'medium', 'beginner', 'LPS',
  'カラフルな大型ポリプが密集するLPS。赤・オレンジ・グリーン・マルチカラーなど非常に色彩が豊富でコレクター人気が高い。',
  '低照度でも飼育可能。週1〜2回の給餌（コペポーダ等）で色揚げと成長を促進。',
  'Admin', 'Japan'
),
(
  'Goniopora stokesi', 'Flower Pot Coral', 'フラワーポットコーラル',
  'Gonioporidae', 'Goniopora', 'Indo-Pacific',
  'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.3,
  'medium', 'low', 'intermediate', 'LPS',
  '長く伸びるポリプが花束のように見える美しいLPS。グリーン・ブラウン系が多い。飼育が難しい種としても知られる。',
  '安定した水質が必須。フィトプランクトンやアミノ酸の添加が長期飼育に有効。急激な変化に弱い。',
  'Admin', 'Australia'
),
(
  'Alveopora sp.', 'Daisy Coral', 'デイジーコーラル',
  'Gonioporidae', 'Alveopora', 'Indo-Pacific',
  'インド洋・太平洋',
  22, 28, 33, 35, 8.1, 8.3,
  'low', 'low', 'beginner', 'LPS',
  'ゴニオポラに似た花形ポリプを持つLPS。ゴニオポラより飼育が容易で初心者にも向く。グリーン・ホワイト系が多い。',
  'ゴニオポラより適応力が高い。定期的な給餌で健康を維持。低水流の場所が適している。',
  'Admin', 'Japan'
),
(
  'Caulastrea furcata', 'Candy Cane Coral', 'キャンディーケーンコーラル',
  'Merulinidae', 'Caulastrea', 'Indo-Pacific',
  'インド洋・西太平洋',
  22, 28, 33, 35, 8.1, 8.3,
  'medium', 'medium', 'intermediate', 'LPS',
  '緑と白のストライプが飴玉のような外見から名付けられたLPS。管状のポリプが密集。初心者から中級者向け。',
  '中程度の光と水流で安定飼育。週1回の給餌で良好な成長。隣接するサンゴに注意。',
  'Admin', 'Japan'
),
(
  'Galaxea fascicularis', 'Galaxea Coral', 'ギャラクシアコーラル',
  'Euphylliidae', 'Galaxea', 'Indo-Pacific',
  'インド洋・太平洋・紅海',
  23, 27, 33, 35, 8.1, 8.3,
  'medium', 'medium', 'intermediate', 'LPS',
  '星のように輝くポリプが集合するLPS。グリーン・ブラウン系が多い。攻撃性が高く長いスイーパー触手を持つ。',
  '他のサンゴから20cm以上離して配置すること。スイーパー触手に触れたサンゴはダメージを受ける。',
  'Admin', 'Australia'
),
(
  'Euphyllia divisa', 'Frogspawn Coral', 'フロッグスポーンコーラル',
  'Euphylliidae', 'Euphyllia', 'Indo-Pacific',
  'インド洋・西太平洋',
  23, 27, 33, 35, 8.1, 8.3,
  'medium', 'low', 'intermediate', 'LPS',
  'ポリプの先端がカエルの卵（卵塊）のように丸みを帯びる美しいLPS。グリーン・タン・ゴールド系。ハンマーコーラルの近縁種。',
  '水流が強すぎるとポリプが収縮するので低〜中水流が最適。週1〜2回の給餌を推奨。',
  'Admin', 'Japan'
),
(
  'Euphyllia glabrescens', 'Torch Coral', 'トーチコーラル',
  'Euphylliidae', 'Euphyllia', 'Indo-Pacific',
  'インド洋・西太平洋',
  23, 27, 33, 35, 8.1, 8.3,
  'medium', 'low', 'intermediate', 'LPS',
  'ポリプの先端が細長く伸びてたいまつ（トーチ）のように揺れる美しいLPS。グリーン・ゴールド・オレンジチップが人気。',
  'ハンマー・フロッグスポーンと同属のため接触させないこと。週2回程度の給餌が理想。',
  'Admin', 'USA'
),
(
  'Plerogyra sinuosa', 'Bubble Coral', 'バブルコーラル',
  'Euphylliidae', 'Plerogyra', 'Indo-Pacific',
  'インド洋・太平洋・紅海',
  23, 27, 33, 35, 8.1, 8.3,
  'medium', 'low', 'intermediate', 'LPS',
  'ブドウ状・泡状のポリプが特徴的なLPS。昼間は大きく膨らみ、夜間はスイーパー触手を出す。ホワイト・グリーン系が多い。',
  '強い水流でバブルが萎縮するため低水流を維持。夜間に攻撃的になるため配置に注意。',
  'Admin', 'Japan'
),
(
  'Heliofungia actiniformis', 'Long Tentacle Plate Coral', 'プレートコーラル',
  'Fungiidae', 'Heliofungia', 'Indo-Pacific',
  'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.3,
  'medium', 'low', 'intermediate', 'LPS',
  'イソギンチャクのような長い触手を持つ独特な円盤形LPS。砂底に置いて飼育。グリーン・ブラウン系が多い。',
  '砂底に直置きが必須。岩の上に置くと弱ることがある。週1〜2回の給餌で良好な成長。',
  'Admin', 'Australia'
),
(
  'Fungia repanda', 'Disk Coral', 'ディスクコーラル',
  'Fungiidae', 'Fungia', 'Indo-Pacific',
  'インド洋・太平洋',
  22, 28, 33, 35, 8.1, 8.3,
  'low', 'low', 'beginner', 'LPS',
  '円盤状の骨格を持つ単体性LPS。砂底に置いて飼育。ブラウン・グリーン・パープル系。自力で移動できる珍しい種。',
  '砂底に置いて管理。ひっくり返ることがあるが自分で元に戻れる。定期的な給餌で長期飼育が可能。',
  'Admin', 'Japan'
),
(
  'Acanthastrea echinata', 'Acan Coral', 'アカンコーラル',
  'Merulinidae', 'Acanthastrea', 'Indo-Pacific',
  'インド洋・太平洋',
  22, 28, 33, 35, 8.1, 8.3,
  'low', 'medium', 'beginner', 'LPS',
  'カラフルな大型ポリプが密集するコレクター人気の高いLPS。赤・オレンジ・グリーン・マルチカラーなど色彩が非常に豊富。',
  '低照度でも飼育可能。週1〜2回の給餌で色揚げ効果がある。飼育しやすく初心者にもおすすめ。',
  'Admin', 'Japan'
),
(
  'Favia speciosa', 'Favia Coral', 'ファビアコーラル',
  'Merulinidae', 'Favia', 'Indo-Pacific',
  'インド洋・太平洋・紅海',
  22, 28, 33, 35, 8.1, 8.3,
  'medium', 'medium', 'intermediate', 'LPS',
  'ドーム状に成長する大型ハードコーラル。迷路状の縫合が特徴的。グリーン・ブラウン・マルチカラーなど多彩。',
  '夜間にスイーパー触手を出すため配置に注意。週1〜2回の給餌が推奨。',
  'Admin', 'Australia'
),
(
  'Favites abdita', 'Favites Brain Coral', 'ファビテスコーラル',
  'Merulinidae', 'Favites', 'Indo-Pacific',
  'インド洋・太平洋',
  22, 28, 33, 35, 8.1, 8.3,
  'medium', 'medium', 'beginner', 'LPS',
  'ファビアに似た脳サンゴ型のLPS。グリーン・ブルー・マルチカラーなど鮮やかな個体も多い。比較的丈夫で飼育しやすい。',
  '適応力が高く水質変化にも比較的耐性あり。定期的な給餌で健康を維持。',
  'Admin', 'Japan'
),
(
  'Platygyra sinensis', 'Brain Worm Coral', 'プラティギラコーラル',
  'Merulinidae', 'Platygyra', 'Indo-Pacific',
  'インド洋・太平洋',
  22, 28, 33, 35, 8.1, 8.3,
  'medium', 'medium', 'beginner', 'LPS',
  '迷路状の溝が走る脳サンゴ型LPS。グリーン・ブルー・マルチカラーの蛍光個体が美しい。比較的育てやすい。',
  '中程度の光と水流で安定飼育。週1〜2回の給餌。スイーパー触手に注意して隣接サンゴと距離を置く。',
  'Admin', 'USA'
),

-- ===== ソフトコーラル =====
(
  'Xenia umbellata', 'Pumping Xenia', 'ポンピングゼニア',
  'Xeniidae', 'Xenia', 'Indo-Pacific',
  'インド洋・太平洋',
  22, 28, 33, 35, 8.1, 8.4,
  'medium', 'medium', 'beginner', 'soft',
  'ポリプがリズミカルに開閉（ポンピング）する動きが魅力的なソフトコーラル。ホワイト・タン系。観賞用に非常に人気。',
  '増殖が旺盛なため他のサンゴを侵食しないよう管理が必要。水質が良すぎると増えすぎる場合も。',
  'Admin', 'Japan'
),
(
  'Capnella imbricata', 'Kenya Tree Coral', 'ケニアツリーコーラル',
  'Nephtheidae', 'Capnella', 'Indo-Pacific',
  'インド洋・東アフリカ・ケニア沿岸',
  22, 28, 32, 35, 8.0, 8.4,
  'medium', 'medium', 'beginner', 'soft',
  '木の枝のように伸びるソフトコーラル。タン・グリーン系で小さな白いポリプが全体を覆う。成長が早く丈夫。',
  '増殖が旺盛。フラギングで容易に増やせる。活性炭を使用すると近隣サンゴへの影響を軽減できる。',
  'Admin', 'Japan'
),
(
  'Sarcophyton trocheliophorum', 'Toadstool Leather Coral', 'ヒキガエルコーラル',
  'Alcyoniidae', 'Sarcophyton', 'Indo-Pacific',
  'インド洋・太平洋',
  22, 28, 32, 35, 8.0, 8.4,
  'medium', 'medium', 'beginner', 'soft',
  '傘状・トードスツール型に成長する大型ソフトコーラル。タン・グリーン・ゴールド系。丈夫で成長が早い人気種。',
  'テルペン系化学物質を分泌するため活性炭必須。定期的に脱皮するが正常な行動。',
  'Admin', 'Australia'
),
(
  'Lobophytum crassum', 'Devil''s Hand Leather Coral', 'デビルズハンドコーラル',
  'Alcyoniidae', 'Lobophytum', 'Indo-Pacific',
  'インド洋・太平洋',
  22, 28, 32, 35, 8.0, 8.4,
  'medium', 'medium', 'beginner', 'soft',
  '手のひらのような形状に成長するレザーコーラル。クリーム・タン・ライトグリーン系。非常に丈夫で飼育しやすい。',
  'ロボフィタムもテルペンを分泌するため活性炭を使用推奨。成長が遅めでゆっくり大きくなる。',
  'Admin', 'Japan'
),
(
  'Nephthea sp.', 'Tree Coral', 'ネフテアコーラル',
  'Nephtheidae', 'Nephthea', 'Indo-Pacific',
  'インド洋・太平洋',
  22, 28, 32, 35, 8.0, 8.4,
  'low', 'low', 'beginner', 'soft',
  '樹木状に成長する非光合成系ソフトコーラル。ピンク・オレンジ・レッド系で非常に華やか。給餌が必要な種。',
  '光合成をしないため定期的なフィトプランクトン・ズープランクトンの給餌が必須。水流は弱め推奨。',
  'Admin', 'Japan'
),
(
  'Tubipora musica', 'Pipe Organ Coral', 'パイプオルガンコーラル',
  'Tubiporidae', 'Tubipora', 'Indo-Pacific',
  'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.4,
  'medium', 'medium', 'intermediate', 'soft',
  '赤い管状骨格と緑のポリプのコントラストが美しいユニークなソフトコーラル。骨格はオルガンパイプ状で観賞価値が高い。',
  '石灰質の骨格を形成するため微量元素の補充が有効。中程度の光と水流で管理。',
  'Admin', 'Australia'
),
(
  'Palythoa grandis', 'Giant Palythoa', 'ジャイアントパリトア',
  'Zoanthidae', 'Palythoa', 'Indo-Pacific',
  'インド洋・太平洋・カリブ海',
  22, 28, 33, 35, 8.0, 8.4,
  'medium', 'medium', 'beginner', 'soft',
  'ズーアンサスより大型のポリプを持つパリトア。ブラウン・グリーン・マルチカラーなど多彩。取り扱い時はパリトキシンに注意。',
  '素手での取り扱い厳禁（パリトキシン毒素）。必ずグローブを着用すること。飼育自体は容易。',
  'Admin', 'Japan'
),
(
  'Rhodactis sp.', 'Hairy Mushroom', 'ヘアリーマッシュルーム',
  'Discosomatidae', 'Rhodactis', 'Indo-Pacific',
  '熱帯・亜熱帯の世界各地',
  22, 28, 32, 35, 8.0, 8.4,
  'low', 'low', 'beginner', 'soft',
  '表面に毛状の突起を持つマッシュルームコーラル。グリーン・ブルー・マルチカラーなど多彩。大型個体は小魚を捕食することも。',
  '低光量・低水流でも育つ丈夫な種。増殖が旺盛。大きくなりすぎた場合はカットして増殖可能。',
  'Admin', 'USA'
),
(
  'Cladiella sp.', 'Colt Coral', 'コルトコーラル',
  'Alcyoniidae', 'Cladiella', 'Indo-Pacific',
  'インド洋・太平洋',
  22, 28, 32, 35, 8.0, 8.4,
  'medium', 'medium', 'beginner', 'soft',
  'カリフラワー状に枝分かれするソフトコーラル。クリーム・タン・ライトグリーン系。触ると柔らかく弾力がある。',
  '成長が早く初心者向け。テルペンを分泌するため活性炭の使用を推奨。フラギングで容易に増殖。',
  'Admin', 'Japan'
);
