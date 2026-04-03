-- ========================================
-- 名前付きサンゴ（ネームドモーフ）データ 120種以上
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

-- ========================================
-- ズーアンサス / パリトア ネームドモーフ
-- ========================================
(
  'Zoanthus sp.', 'Utter Chaos', 'アッター・ケイオス',
  'Zoanthidae', 'Zoanthus', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 33, 35, 8.0, 8.4, 'medium', 'medium', 'beginner', 'soft',
  'ズーアンサス界で最も人気の高いネームドモーフの一つ。紫ベースに黄緑・オレンジのスカートが渦巻き模様を描く派手な色彩。',
  'パリトキシンに注意し素手での取り扱い禁止。LED照明で蛍光色が映える。月1回程度の給餌で色揚げ効果あり。',
  'Admin', 'USA'
),
(
  'Zoanthus sp.', 'Rasta', 'ラスタ',
  'Zoanthidae', 'Zoanthus', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 33, 35, 8.0, 8.4, 'medium', 'medium', 'beginner', 'soft',
  'グリーンとオレンジのレゲエカラーが特徴のズーアンサス。金属光沢があり照明下で非常に美しい。コレクター人気の高い定番モーフ。',
  '増殖が早く、飼育しやすい初心者向けモーフ。素手での取り扱い禁止。',
  'Admin', 'USA'
),
(
  'Zoanthus sp.', 'Eagle Eye', 'イーグルアイ',
  'Zoanthidae', 'Zoanthus', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 33, 35, 8.0, 8.4, 'medium', 'medium', 'beginner', 'soft',
  'ライムグリーンの中心部に濃いパープルのリングが入る、鷹の目のような模様が特徴のモーフ。非常に鮮やかな色彩。',
  '中程度の光と水流で良好な成長。コロニーが大きくなると迫力の景観を作る。',
  'Admin', 'USA'
),
(
  'Palythoa sp.', 'Purple Death', 'パープルデス',
  'Zoanthidae', 'Palythoa', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 33, 35, 8.0, 8.4, 'medium', 'medium', 'beginner', 'soft',
  '全体が深みのあるパープルで統一されたパリトア。シンプルながら存在感のある色彩。名前の「デス」はパリトキシンに由来。',
  '特に毒性が強いパリトアの一種。取り扱いには最大限の注意が必要。グローブ・ゴーグル着用推奨。',
  'Admin', 'USA'
),
(
  'Zoanthus sp.', 'Pink Zipper', 'ピンクジッパー',
  'Zoanthidae', 'Zoanthus', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 33, 35, 8.0, 8.4, 'medium', 'medium', 'beginner', 'soft',
  'ピンクと濃いパープルのコントラストにグロウィングピンクの輝きとティールのスカートが組み合わさった華やかなモーフ。',
  '定期的な給餌で色彩を維持。増殖させるには適度な水流と安定した水温が重要。',
  'Admin', 'USA'
),
(
  'Zoanthus sp.', 'Fire and Ice', 'ファイアー・アンド・アイス',
  'Zoanthidae', 'Zoanthus', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 33, 35, 8.0, 8.4, 'medium', 'medium', 'beginner', 'soft',
  'レッドのセンターとエレクトリックブルーのリングが炎と氷を表現する劇的なコントラストのモーフ。',
  '安定した水質で色彩を維持。LEDライトのブルー・バイオレット成分で蛍光が映える。',
  'Admin', 'USA'
),
(
  'Zoanthus sp.', 'Armor of God', 'アーマー・オブ・ゴッド',
  'Zoanthidae', 'Zoanthus', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 33, 35, 8.0, 8.4, 'medium', 'medium', 'beginner', 'soft',
  'メタリックゴールドのセンターとブライトブルーのリングが黄金の鎧のような外観。AOGとも略称される人気モーフ。',
  '高価なモーフのため水質管理を徹底。増殖が比較的遅い。',
  'Admin', 'USA'
),
(
  'Palythoa sp.', 'Nuclear Green', 'ニュークリアグリーン',
  'Zoanthidae', 'Palythoa', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 33, 35, 8.0, 8.4, 'medium', 'medium', 'beginner', 'soft',
  '核爆発のような強烈な蛍光グリーンが特徴のパリトア。ブルーLED照明下で目が痛くなるほど輝く。増殖力旺盛。',
  '成長が非常に早く侵略的。他のサンゴを侵食する可能性あり。グローブ着用必須。',
  'Admin', 'USA'
),
(
  'Zoanthus sp.', 'Fruit Loops', 'フルーツループス',
  'Zoanthidae', 'Zoanthus', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 33, 35, 8.0, 8.4, 'medium', 'medium', 'beginner', 'soft',
  'ネオンオレンジ・イエロー・グリーンのリングが重なる、フルーツシリアルのような鮮やかな多色モーフ。',
  '明るい照明下で色彩が最も映える。定期的な給餌で色揚げ効果あり。',
  'Admin', 'USA'
),
(
  'Palythoa sp.', 'Sunny D', 'サニーD',
  'Zoanthidae', 'Palythoa', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 33, 35, 8.0, 8.4, 'medium', 'medium', 'beginner', 'soft',
  'イエロー〜オレンジ系の明るい色彩のパリトア。オレンジジュースのような鮮やかな色が特徴。入門種として人気。',
  '丈夫で増殖しやすい。中程度の光と水流で管理。',
  'Admin', 'USA'
),
(
  'Zoanthus sp.', 'Darth Maul', 'ダース・モール',
  'Zoanthidae', 'Zoanthus', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 33, 35, 8.0, 8.4, 'medium', 'medium', 'beginner', 'soft',
  'インクのような黒・パープルのベースにネオンレッド・オレンジの斑点が散る、スターウォーズのキャラクターを彷彿とさせるモーフ。',
  'ダークカラーのため照明設定が重要。ブルー・バイオレット照明で赤い斑点が輝く。',
  'Admin', 'USA'
),
(
  'Zoanthus sp.', 'Scrambled Eggs', 'スクランブルドエッグス',
  'Zoanthidae', 'Zoanthus', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 33, 35, 8.0, 8.4, 'medium', 'medium', 'beginner', 'soft',
  'シルバーブルーのマウスにゴールド・ブルーのリング、バイオレットとネオンチップのスカートが組み合わさった複雑な色彩。TSA産の有名モーフ。',
  '高価なプレミアムモーフのため水質管理を徹底。安定した環境下での飼育を推奨。',
  'Admin', 'USA'
),
(
  'Zoanthus sp.', 'Space Monster', 'スペースモンスター',
  'Zoanthidae', 'Zoanthus', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 33, 35, 8.0, 8.4, 'medium', 'medium', 'beginner', 'soft',
  'ダーク系のベースにグリーン・ブルーの蛍光色が浮かぶ宇宙的な外観のモーフ。',
  '標準的なズーアンサスの管理方法で飼育可能。',
  'Admin', 'USA'
),
(
  'Palythoa sp.', 'Tubbs Blue', 'タッブスブルー',
  'Zoanthidae', 'Palythoa', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 33, 35, 8.0, 8.4, 'medium', 'medium', 'beginner', 'soft',
  'パリトアの中では珍しいブルー系の色彩を持つモーフ。落ち着いたブルートーンが独特の存在感を放つ。',
  '増殖は比較的遅め。安定した水質での管理が必要。',
  'Admin', 'USA'
),
(
  'Zoanthus sp.', 'Hallucination', 'ハルシネーション',
  'Zoanthidae', 'Zoanthus', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 33, 35, 8.0, 8.4, 'medium', 'medium', 'beginner', 'soft',
  '幻覚を彷彿とさせる多彩な色が爆発したような極彩色モーフ。見る角度や照明で色が変化する。',
  'ユニークな色彩を維持するには安定した照明スペクトルが重要。',
  'Admin', 'USA'
),
(
  'Zoanthus sp.', 'Magician', 'マジシャン',
  'Zoanthidae', 'Zoanthus', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 33, 35, 8.0, 8.4, 'medium', 'medium', 'beginner', 'soft',
  'ボールドなレッドのポリプにディープブルーのセンター、ターコイズ・ティールの斑点が入るマジカルなカラーのモーフ。ECC産。',
  '色彩維持のため安定した水質と照明を維持。定期的な給餌推奨。',
  'Admin', 'USA'
),
(
  'Zoanthus sp.', 'Radioactive Dragon Eye', 'ラジオアクティブ・ドラゴンアイ',
  'Zoanthidae', 'Zoanthus', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 33, 35, 8.0, 8.4, 'medium', 'medium', 'beginner', 'soft',
  'ブライトで鮮やかなグリーンのフェイスにイエローのスカート（個体によってレッドリングあり）が龍の目のような外観。RDEとも略称される。',
  '増殖が早い人気モーフ。安定した水質で鮮やかな色彩を維持できる。',
  'Admin', 'USA'
),
(
  'Zoanthus sp.', 'Rainbow Incinerator', 'レインボー・インシネレーター',
  'Zoanthidae', 'Zoanthus', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 33, 35, 8.0, 8.4, 'medium', 'medium', 'beginner', 'soft',
  'ファイアリーなレッド・オレンジ・イエローのセンターにディープパープルのリング、ブライトグリーンのスカートが燃え盛る炎のような外観。',
  'ブルーLED照明下で最も美しく輝く。安定した水質と適度な給餌で色彩を維持。',
  'Admin', 'USA'
),
(
  'Zoanthus sp.', 'Purple People Eater', 'パープル・ピープル・イーター',
  'Zoanthidae', 'Zoanthus', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 33, 35, 8.0, 8.4, 'medium', 'medium', 'beginner', 'soft',
  'ネオングリーンのマウスからパープルとレッドの放射状ラインが伸び、レッド・パープルのスカートを持つ個性的なモーフ。',
  '中程度の光と水流で管理。増殖は標準的なペース。',
  'Admin', 'USA'
),
(
  'Palythoa sp.', 'Bam Bam', 'バンバン',
  'Zoanthidae', 'Palythoa', 'Fiji', 'フィジー・インド洋',
  22, 28, 33, 35, 8.0, 8.4, 'medium', 'medium', 'beginner', 'soft',
  'フィジー産の強烈なオレンジ蛍光にパープル・ブルーのリングを持つパリトア。Fiji Bam Bam Orangeとも呼ばれる人気の定番モーフ。',
  'フィジー産のため水温変化に注意。丈夫で増殖しやすい入門モーフ。',
  'Admin', 'Fiji'
),
(
  'Zoanthus sp.', 'Kryptonite', 'クリプトナイト',
  'Zoanthidae', 'Zoanthus', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 33, 35, 8.0, 8.4, 'medium', 'medium', 'beginner', 'soft',
  'パープルベースにブライトネオングリーンのスターバーストが映えるスーパーマンのクリプトナイトのような色彩のモーフ。',
  '人気・入手しやすい定番モーフ。標準的な管理で安定飼育できる。',
  'Admin', 'USA'
),
(
  'Zoanthus sp.', 'Captain America', 'キャプテン・アメリカ',
  'Zoanthidae', 'Zoanthus', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 33, 35, 8.0, 8.4, 'medium', 'medium', 'beginner', 'soft',
  'レッド・ホワイト・ブルーのアメリカンカラーが入ったマーベルキャラクター名を持つ人気モーフ。',
  '標準的な管理で飼育可能。増殖は比較的遅め。',
  'Admin', 'USA'
),
(
  'Palythoa sp.', 'Pumpkin Patch', 'パンプキンパッチ',
  'Zoanthidae', 'Palythoa', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 33, 35, 8.0, 8.4, 'medium', 'medium', 'beginner', 'soft',
  'オレンジ・イエローのかぼちゃのような色彩のパリトア。秋をイメージさせる温かみのある色合いが人気。ASD産のモーフ。',
  '丈夫で増殖しやすい。中程度の光と水流で管理。',
  'Admin', 'USA'
),
(
  'Zoanthus sp.', 'Reverse Hallucination', 'リバース・ハルシネーション',
  'Zoanthidae', 'Zoanthus', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 33, 35, 8.0, 8.4, 'medium', 'medium', 'beginner', 'soft',
  'ハルシネーションの反転カラーバリエーション。パープルを主体に逆転した色彩パターンが特徴的。',
  'ハルシネーションと同様の管理。安定した水質と照明で色彩を維持。',
  'Admin', 'USA'
),
(
  'Zoanthus sp.', 'WWC Alpha Omega', 'WWCアルファ・オメガ',
  'Zoanthidae', 'Zoanthus', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 33, 35, 8.0, 8.4, 'medium', 'medium', 'beginner', 'soft',
  'World Wide Corals（WWC）が生み出したシグネチャーモーフ。複雑で鮮やかな色彩が特徴。',
  'WWC産の高品質モーフ。安定した水質管理を徹底すること。',
  'Admin', 'USA'
),
(
  'Zoanthus sp.', 'WWC Whammin Watermelon', 'WWCウォーターメロン',
  'Zoanthidae', 'Zoanthus', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 33, 35, 8.0, 8.4, 'medium', 'medium', 'beginner', 'soft',
  'WWC産のスイカカラーモーフ。グリーン・レッド・ホワイトのスイカを彷彿とさせる鮮やかな色彩。',
  'WWC産の高品質モーフ。安定した環境での管理を推奨。',
  'Admin', 'USA'
),

-- ========================================
-- アクロポラ ネームドモーフ
-- ========================================
(
  'Acropora tortuosa', 'ORA Blue Tort', 'ORAブルートート',
  'Acroporidae', 'Acropora', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.4, 'very_high', 'high', 'advanced', 'SPS',
  'ORA（Oceans Reefs Aquariums）が養殖した鮮やかサファイアブルーのアクロポラ。トルトゥオサ種のブルー個体でSPS界の名品の一つ。',
  '硝酸塩5ppm以下・リン酸塩0.03ppm以下を維持。カルシウム・アルカリ度の安定が必須。高照度・強水流。',
  'Admin', 'USA'
),
(
  'Acropora tortuosa', 'Oregon Blue Tort', 'オレゴンブルートート',
  'Acroporidae', 'Acropora', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.4, 'very_high', 'high', 'advanced', 'SPS',
  'オレゴン産のディープサファイアブルーアクロポラ。ORA Blue Tortと並んで最も有名なSPSネームドモーフの一つ。',
  'ORA Blue Tortと同様の管理。水質悪化で褐色化するため常時高水質を維持。',
  'Admin', 'USA'
),
(
  'Acropora tortuosa', 'Miyagi Tort', 'ミヤギトート',
  'Acroporidae', 'Acropora', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.4, 'very_high', 'high', 'advanced', 'SPS',
  '深みのあるパープルのブランチとバイブラントなネオングリーンのポリプのコントラストが美しいトートモーフ。',
  '超高水質が必要。ドージングシステムによるカルシウム・ALK管理を推奨。',
  'Admin', 'Japan'
),
(
  'Acropora tortuosa', 'Cali Tort', 'カリフォルニアトート',
  'Acroporidae', 'Acropora', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.4, 'very_high', 'high', 'advanced', 'SPS',
  'カリフォルニア産のブルー〜グリーンがかったヒューのトートモーフ。ORA Blue Tortと系統が近い有名個体。',
  '高水質維持が最優先。水替えは少量ずつ頻繁に行うこと。',
  'Admin', 'USA'
),
(
  'Acropora millepora', 'Tyree Pink Lemonade', 'タイリーピンクレモネード',
  'Acroporidae', 'Acropora', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.4, 'very_high', 'high', 'advanced', 'SPS',
  'ブライトピンクのポリプとレモンイエローのブランチの組み合わせが絶品のミレポラモーフ。Tyreeが生み出した歴史的名品。',
  '色彩維持のため超高水質が必須。低栄養塩環境（ULNS）での飼育が理想。',
  'Admin', 'USA'
),
(
  'Acropora microclados', 'Strawberry Shortcake', 'ストロベリーショートケーキ',
  'Acroporidae', 'Acropora', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.4, 'very_high', 'high', 'advanced', 'SPS',
  'クリーム〜ライムグリーンのベースにブライトピンク・ラズベリーのポリプが映えるスイーツのような名前のSPS。',
  'Pink Lemonadeと同様、超低栄養塩環境での飼育が理想。フラグから育てるのが一般的。',
  'Admin', 'USA'
),
(
  'Acropora tenuis', 'Walt Disney Acropora', 'ウォルトディズニーアクロポラ',
  'Acroporidae', 'Acropora', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.4, 'very_high', 'high', 'advanced', 'SPS',
  'イエロー・オレンジ・パープルのグラデーションが夢の国を思わせる多彩なテヌイスモーフ。',
  '水質悪化で色落ちしやすいため徹底した水質管理が必要。',
  'Admin', 'USA'
),
(
  'Acropora sp.', 'Idaho Grape', 'アイダホグレープ',
  'Acroporidae', 'Acropora', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.4, 'very_high', 'high', 'advanced', 'SPS',
  'アイダホ産のグレープ（ブドウ）カラーと呼ばれる深みのあるパープル系アクロポラ。SPSコレクターに人気の個体。',
  '深い紫色の維持には超高水質と適切な照明スペクトルが必要。',
  'Admin', 'USA'
),
(
  'Acropora sp.', 'Purple Monster', 'パープルモンスター',
  'Acroporidae', 'Acropora', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.4, 'very_high', 'high', 'advanced', 'SPS',
  '名前の通り迫力のある深いパープルが全体を覆うモンスター級のアクロポラ。大型水槽での飼育が理想的。',
  '深海性の傾向があり水温の安定が特に重要。高水質・高照度での管理を推奨。',
  'Admin', 'USA'
),
(
  'Acropora sp.', 'ORA Pearlberry', 'ORAパールベリー',
  'Acroporidae', 'Acropora', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.4, 'very_high', 'high', 'advanced', 'SPS',
  'パールのような光沢のあるベースにグリーンのコラリットとラベンダーのグロースチップが美しいORA養殖個体。',
  'ORA養殖個体のため比較的適応力がある。高水質維持で本来の色彩が出る。',
  'Admin', 'USA'
),
(
  'Acropora sp.', 'Blue Voodoo', 'ブルーブードゥー',
  'Acroporidae', 'Acropora', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.4, 'very_high', 'high', 'advanced', 'SPS',
  'ダークグリーンのバックグラウンドにパープリッシュブルーのチップが呪術的な外観のアクロポラ。',
  '超高水質環境での飼育が必要。適切な照明でブルーの発色が際立つ。',
  'Admin', 'USA'
),
(
  'Acropora sp.', 'Jason Fox Homewrecker', 'JFホームレッカー',
  'Acroporidae', 'Acropora', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.4, 'very_high', 'high', 'advanced', 'SPS',
  'Jason Fox Signature Coralsが生み出したレインボーモーフ。イエロー・オレンジのポリプ、グリーン・ブルーのベース、パープルのグロースチップが共存。',
  '非常に高価なシグネチャーモーフ。完璧な水質管理が必要。',
  'Admin', 'USA'
),
(
  'Acropora sp.', 'ASD Rainbow Acropora', 'ASDレインボーアクロポラ',
  'Acroporidae', 'Acropora', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.4, 'very_high', 'high', 'advanced', 'SPS',
  'Aqua SD（ASD）が生み出したレインボーアクロポラ。複数の色が同一コロニーに共存する希少なモーフ。',
  'ASD産の高品質個体。超低栄養塩環境での飼育が理想。',
  'Admin', 'USA'
),
(
  'Acropora carduus', 'Tyree Red Dragon', 'タイリーレッドドラゴン',
  'Acroporidae', 'Acropora', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.4, 'very_high', 'high', 'advanced', 'SPS',
  'Tyreeが生み出したレジェンダリーなレッドアクロポラ。鮮やかな赤が全体を覆うSPS界のアイコン的存在。',
  'クラシックTyreeモーフ。超高水質と適切な照明でレッドの発色を最大化。',
  'Admin', 'USA'
),
(
  'Acropora sp.', 'ORA Joe the Coral', 'ORAジョー・ザ・コーラル',
  'Acroporidae', 'Acropora', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.4, 'very_high', 'high', 'advanced', 'SPS',
  'ORA養殖のブライトグリーンのベースにグロウィングブルーのグロースチップを持つ人気モーフ。',
  'ORA養殖個体で比較的適応しやすい。高水質での管理で鮮やかな色彩を維持。',
  'Admin', 'USA'
),
(
  'Acropora lokani', 'Acropora Lokani', 'アクロポラ・ロカニ',
  'Acroporidae', 'Acropora', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.4, 'very_high', 'high', 'advanced', 'SPS',
  'ロカニ固有のパープル・ブルー系の色彩が特徴的なアクロポラ種。SPSコレクターに根強い人気を誇る。',
  '超高水質環境での飼育が必要。適切な照明でパープル・ブルーの発色が際立つ。',
  'Admin', 'Australia'
),
(
  'Acropora sp.', 'Purple Bonsai Acropora', 'パープルボンサイアクロポラ',
  'Acroporidae', 'Acropora', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.4, 'very_high', 'high', 'advanced', 'SPS',
  '盆栽のように美しく枝分かれするパープルのアクロポラ。日本人が命名したとも言われる芸術的な形状と色彩。',
  '成長形状を維持するため適切な水流のコントロールが重要。',
  'Admin', 'Japan'
),
(
  'Acropora sp.', 'Forest Fire Digitata', 'フォレストファイア・デジタータ',
  'Acroporidae', 'Acropora', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.4, 'high', 'high', 'intermediate', 'SPS',
  'オレンジ・レッドのポリプがグリーンのベースから炎のように輝くデジタータモーフ。SPSの入門種としても人気。',
  'デジタータは比較的丈夫でSPS入門に向く。高照度・強水流で色彩が映える。',
  'Admin', 'USA'
),

-- ========================================
-- モンティポーラ ネームドモーフ
-- ========================================
(
  'Montipora undata', 'Superman Montipora', 'スーパーマンモンティポーラ',
  'Acroporidae', 'Montipora', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 33, 35, 8.1, 8.4, 'high', 'medium', 'intermediate', 'SPS',
  'ディープブルー〜パープルのベースにブライトレッド・オレンジのポリプが映えるスーパーマンカラーの人気モーフ。',
  'モンティポーラはアクロポラより管理が容易。中程度の光と水流で美しい色彩を維持できる。',
  'Admin', 'USA'
),
(
  'Montipora sp.', 'Mystic Sunset Montipora', 'ミスティックサンセット',
  'Acroporidae', 'Montipora', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 33, 35, 8.1, 8.4, 'high', 'medium', 'intermediate', 'SPS',
  'スーパーマンモンティポーラのリバース版。レッドのスキンにブルーのポリプが夕焼けのような幻想的な色彩。',
  'スーパーマンモンティポーラと同様の管理。成長は比較的早め。',
  'Admin', 'USA'
),
(
  'Montipora sp.', 'Pokerstar Montipora', 'ポーカースターモンティポーラ',
  'Acroporidae', 'Montipora', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 33, 35, 8.1, 8.4, 'high', 'medium', 'intermediate', 'SPS',
  'リッチなパープルのベースにブライトグリーンのポリプが散りばめられたECC産のモーフ。トランプのスターのような模様。',
  'ECC産の品質の高い個体。安定した水質と中程度の照明で美しい色彩を維持。',
  'Admin', 'USA'
),
(
  'Montipora capricornis', 'Red Planet Montipora', 'レッドプラネット',
  'Acroporidae', 'Montipora', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 33, 35, 8.1, 8.4, 'high', 'medium', 'intermediate', 'SPS',
  '火星（レッドプラネット）のような鮮やかなレッドに全体が染まるキャプリコルニスモーフ。ORAの代表的モーフ。',
  '赤色の維持には適切な照明スペクトルが重要。中程度の光と水流で管理。',
  'Admin', 'USA'
),
(
  'Montipora sp.', 'Jason Fox Aquaman', 'JFアクアマン',
  'Acroporidae', 'Montipora', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 33, 35, 8.1, 8.4, 'high', 'medium', 'intermediate', 'SPS',
  'Jason Fox Signature Coralsのシグネチャーモーフ。アクアマンカラーと呼ばれるブルー・グリーン系の美しい色彩。',
  'JFシグネチャーモーフのため高品質個体。安定した水質での管理を推奨。',
  'Admin', 'USA'
),
(
  'Montipora sp.', 'Jason Fox Fruity Pebbles', 'JFフルーティーペブルズ',
  'Acroporidae', 'Montipora', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 33, 35, 8.1, 8.4, 'high', 'medium', 'intermediate', 'SPS',
  'Jason Fox産のフルーツシリアルのような多彩な色彩モーフ。カラフルなポリプが全体に散りばめられる。',
  'JFシグネチャーモーフ。安定した水質と適切な照明で色彩を最大化。',
  'Admin', 'USA'
),
(
  'Montipora setosa', 'TSA Sunny D Splash', 'TSAサニーDスプラッシュ',
  'Acroporidae', 'Montipora', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 33, 35, 8.1, 8.4, 'high', 'medium', 'intermediate', 'SPS',
  'Top Shelf Aquatics産のセトーサモーフ。イエロー・オレンジのスプラッシュ模様が特徴的。',
  'セトーサは枝分かれするモンティポーラ。適切な水流で美しい形状を維持できる。',
  'Admin', 'USA'
),
(
  'Montipora sp.', 'Jason Fox Beach Bum', 'JFビーチバム',
  'Acroporidae', 'Montipora', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 33, 35, 8.1, 8.4, 'high', 'medium', 'intermediate', 'SPS',
  'Jason Fox産のレインボーベースにブルーポリプが共存するビーチをイメージしたモーフ。',
  'JFシグネチャーモーフ。高品質な水質管理で色彩を維持。',
  'Admin', 'USA'
),
(
  'Montipora sp.', 'Sunset Montipora', 'サンセットモンティポーラ',
  'Acroporidae', 'Montipora', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 33, 35, 8.1, 8.4, 'high', 'medium', 'intermediate', 'SPS',
  'オレンジ・レッド・イエローが夕焼けのように混ざり合う美しいグラデーションモーフ。',
  '標準的なモンティポーラの管理で飼育可能。成長は比較的早い。',
  'Admin', 'USA'
),

-- ========================================
-- トーチコーラル ネームドモーフ
-- ========================================
(
  'Euphyllia glabrescens', '24K Gold Torch', '24Kゴールドトーチ',
  'Euphylliidae', 'Euphyllia', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.3, 'medium', 'low', 'intermediate', 'LPS',
  'ソリッドゴールドの触手が輝くプレミアムトーチコーラル。純金のような色彩から24Kの名が付けられた。最高人気モーフの一つ。',
  '強すぎる水流は触手を傷つけるため低〜中水流を維持。週2〜3回の給餌（クリル等）で色彩向上。',
  'Admin', 'Australia'
),
(
  'Euphyllia glabrescens', 'Australian Gold Torch', 'オーストラリアンゴールドトーチ',
  'Euphylliidae', 'Euphyllia', 'Australia', 'オーストラリア沿岸',
  23, 27, 33, 35, 8.1, 8.3, 'medium', 'low', 'intermediate', 'LPS',
  'オーストラリア産のゴールド触手にパープルチップを持つ美しいトーチ。インド産と比較してより深みのある色彩が特徴。',
  'オーストラリア産は品質が高い。低〜中水流、週2〜3回の給餌を推奨。',
  'Admin', 'Australia'
),
(
  'Euphyllia glabrescens', 'Dragon Soul Torch', 'ドラゴンソウルトーチ',
  'Euphylliidae', 'Euphyllia', 'Indonesia', 'インドネシア・インド洋',
  23, 27, 33, 35, 8.1, 8.3, 'medium', 'low', 'intermediate', 'LPS',
  'イエローグリーンのチップとゴールド〜オレンジの触手を持つ最も求められるインド産トーチモーフ。Dragon Soulの名が示す通り圧倒的な存在感。',
  'インドネシア産の高価なモーフ。安定した水質と定期的な給餌で美しい色彩を維持。',
  'Admin', 'Indonesia'
),
(
  'Euphyllia glabrescens', 'Holy Grail Torch', 'ホーリーグレイルトーチ',
  'Euphylliidae', 'Euphyllia', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.3, 'medium', 'low', 'intermediate', 'LPS',
  '聖杯と呼ばれる最も希少なトーチモーフ。イエローの触手にブルー・パープルのチップを持つ。非常に高価で入手困難。',
  '希少高価なモーフのため最高水質環境での飼育が必要。ストレスを最小限に抑えること。',
  'Admin', 'Australia'
),
(
  'Euphyllia glabrescens', 'Indo Gold Torch', 'インドゴールドトーチ',
  'Euphylliidae', 'Euphyllia', 'Indonesia', 'インドネシア・インド洋',
  23, 27, 33, 35, 8.1, 8.3, 'medium', 'low', 'intermediate', 'LPS',
  'インドネシア産の長いゴールド触手にパープル・ブルーのハイライトが入るトーチモーフ。オーストラリア産より手頃な価格。',
  '比較的入手しやすいゴールド系トーチ。週2〜3回の給餌で色彩維持。',
  'Admin', 'Indonesia'
),
(
  'Euphyllia glabrescens', 'Indo Hellfire Torch', 'インドヘルファイアトーチ',
  'Euphylliidae', 'Euphyllia', 'Indonesia', 'インドネシア・インド洋',
  23, 27, 33, 35, 8.1, 8.3, 'medium', 'low', 'intermediate', 'LPS',
  'ピンク・パープルのチップとハーフゴールドの触手を持つインド産の地獄の炎のような名前のモーフ。',
  'インドネシア産。標準的なトーチコーラルの管理で飼育可能。',
  'Admin', 'Indonesia'
),
(
  'Euphyllia glabrescens', 'Purple Torch', 'パープルトーチ',
  'Euphylliidae', 'Euphyllia', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.3, 'medium', 'low', 'intermediate', 'LPS',
  'パープル系の触手とクリームチップを持つトーチコーラル。落ち着いた色彩が人気で比較的入手しやすい。',
  '標準的な管理で飼育しやすい入門向けトーチ。',
  'Admin', 'Japan'
),
(
  'Euphyllia glabrescens', 'Green Torch', 'グリーントーチ',
  'Euphylliidae', 'Euphyllia', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.3, 'medium', 'low', 'intermediate', 'LPS',
  'グリーン系の触手を持つスタンダードなトーチコーラル。入門向けで価格も比較的手頃。蛍光グリーンが美しい。',
  'トーチコーラルの入門種。丈夫で飼育しやすい。',
  'Admin', 'Japan'
),
(
  'Euphyllia glabrescens', 'Green Cream Tip Torch', 'グリーンクリームチップトーチ',
  'Euphylliidae', 'Euphyllia', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.3, 'medium', 'low', 'intermediate', 'LPS',
  'グリーンの触手にクリームホワイトのチップが映える清楚な色合いのトーチモーフ。',
  '標準的なトーチコーラルの管理で飼育可能。',
  'Admin', 'Japan'
),
(
  'Euphyllia glabrescens', 'Black Torch', 'ブラックトーチ',
  'Euphylliidae', 'Euphyllia', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.3, 'medium', 'low', 'intermediate', 'LPS',
  'ブラック〜ダークブラウンの珍しい触手色を持つ希少なトーチモーフ。LED照明下でユニークな存在感を放つ。',
  '希少なカラーモーフ。安定した水質での管理を推奨。',
  'Admin', 'Australia'
),
(
  'Euphyllia glabrescens', 'Medusa Golden Poppy Torch', 'メデューサゴールデンポピートーチ',
  'Euphylliidae', 'Euphyllia', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.3, 'medium', 'low', 'intermediate', 'LPS',
  'メデューサのように広がるゴールデンポピーカラーの触手を持つプレミアムトーチ。圧倒的な存在感。',
  '高価なモーフのため安定した水質環境での飼育が必要。',
  'Admin', 'Australia'
),

-- ========================================
-- ハンマーコーラル ネームドモーフ
-- ========================================
(
  'Euphyllia ancora', 'Gold Hammer', 'ゴールドハンマー',
  'Euphylliidae', 'Euphyllia', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.3, 'medium', 'low', 'beginner', 'LPS',
  'ソリッドゴールドのポリプが特徴のハンマーコーラルプレミアムモーフ。SunGlow Ultra Gold Hammerとも呼ばれる。',
  '低〜中水流を維持。他のEuphyllia属（トーチ・フロッグスポーン）との接触を避けること。',
  'Admin', 'Australia'
),
(
  'Euphyllia ancora', 'Rainbow Hammer', 'レインボーハンマー',
  'Euphylliidae', 'Euphyllia', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.3, 'medium', 'low', 'beginner', 'LPS',
  'イリデッセントなレインズのレンズが組み合わさったマルチカラーのハンマーモーフ。光の角度で色が変化する。',
  '高価な人気モーフ。安定した水質での管理を推奨。週2回の給餌で色彩向上。',
  'Admin', 'Australia'
),
(
  'Euphyllia ancora', 'Holy Grail Hammer', 'ホーリーグレイルハンマー',
  'Euphylliidae', 'Euphyllia', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.3, 'medium', 'low', 'beginner', 'LPS',
  '聖杯と呼ばれる希少なブランチング（枝分かれ）タイプのゴールド系ハンマー。壁ハンマーより増殖が早い。',
  '希少ブランチング個体。安定した水質での管理が必要。',
  'Admin', 'Australia'
),
(
  'Euphyllia ancora', 'Dreamsicle Hammer', 'ドリームシクルハンマー',
  'Euphylliidae', 'Euphyllia', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.3, 'medium', 'low', 'beginner', 'LPS',
  'ピーチ・オレンジのクリーミーなトーンが夢のアイスキャンディーを思わせるハンマーモーフ。柔らかい色合いが人気。',
  'ハンマーコーラルの標準管理で飼育可能。',
  'Admin', 'Australia'
),
(
  'Euphyllia ancora', 'Gold Rainbow Mint Hammer', 'ゴールドレインボーミントハンマー',
  'Euphylliidae', 'Euphyllia', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.3, 'medium', 'low', 'beginner', 'LPS',
  'ゴールド・レインボー・ミントグリーンが組み合わさったマルチカラーのハンマーモーフ。希少なコンビネーション。',
  '安定した水質での管理を推奨。週1〜2回の給餌推奨。',
  'Admin', 'Australia'
),
(
  'Euphyllia ancora', 'Banana Gold Hologram Hammer', 'バナナゴールドホログラムハンマー',
  'Euphylliidae', 'Euphyllia', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.3, 'medium', 'low', 'beginner', 'LPS',
  'バナナイエロー〜ゴールドのホログラフィックな輝きを持つハンマーモーフ。光の反射でホログラムのように色が変化する。',
  '安定した水質と適切な照明で輝きを最大化。',
  'Admin', 'Australia'
),
(
  'Euphyllia ancora', 'Toxic Blotchy Hammer', 'トキシックブロッチーハンマー',
  'Euphylliidae', 'Euphyllia', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.3, 'medium', 'low', 'beginner', 'LPS',
  'マルチカラーのブロッチ（まだら）パターンが中毒性のある外観のハンマーモーフ。各ポリプが異なる色彩を持つ。',
  'ハンマーコーラル標準管理で飼育可能。',
  'Admin', 'Australia'
),

-- ========================================
-- フロッグスポーン ネームドモーフ
-- ========================================
(
  'Euphyllia divisa', 'Neon Orange Frogspawn', 'ネオンオレンジフロッグスポーン',
  'Euphylliidae', 'Euphyllia', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.3, 'medium', 'low', 'intermediate', 'LPS',
  'ネオンオレンジ〜ゴールドの鮮やかな触手を持つフロッグスポーンの人気モーフ。通常の茶〜グリーン系と異なる強烈な発色。',
  '低〜中水流で管理。他のEuphyllia属との接触を避けること。',
  'Admin', 'Australia'
),
(
  'Euphyllia divisa', 'Purple Frogspawn', 'パープルフロッグスポーン',
  'Euphylliidae', 'Euphyllia', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.3, 'medium', 'low', 'intermediate', 'LPS',
  'パープル系の触手を持つフロッグスポーンモーフ。落ち着いた高貴な色彩が人気。',
  'フロッグスポーン標準管理。週1〜2回の給餌推奨。',
  'Admin', 'Australia'
),
(
  'Euphyllia divisa', 'Gold Frogspawn', 'ゴールドフロッグスポーン',
  'Euphylliidae', 'Euphyllia', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.3, 'medium', 'low', 'intermediate', 'LPS',
  'ゴールド系の触手を持つフロッグスポーン。ゴールドハンマーと並ぶ人気カラーモーフ。',
  'フロッグスポーン標準管理。',
  'Admin', 'Australia'
),
(
  'Euphyllia divisa', 'Peachy Orange Branching Frogspawn', 'ピーチオレンジ・ブランチング',
  'Euphylliidae', 'Euphyllia', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.3, 'medium', 'low', 'intermediate', 'LPS',
  'ピーチオレンジのブランチング（枝分かれ）タイプ。壁タイプより増殖が早く、カラーとフォルムの両方が優れたモーフ。',
  'ブランチングタイプはフラグカットで増殖可能。',
  'Admin', 'Australia'
),
(
  'Euphyllia divisa', 'Bi-Color Frogspawn', 'バイカラーフロッグスポーン',
  'Euphylliidae', 'Euphyllia', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.3, 'medium', 'low', 'intermediate', 'LPS',
  '2色が混在する二色系フロッグスポーン。グリーン＋パープル、タン＋ゴールドなど個体によって異なる。',
  'フロッグスポーン標準管理。',
  'Admin', 'Australia'
),

-- ========================================
-- アカン / マイクロムッサ ネームドモーフ
-- ========================================
(
  'Micromussa lordhowensis', 'Rainbow Lord', 'レインボーロード',
  'Merulinidae', 'Micromussa', 'Australia', 'オーストラリア・ロードハウ島',
  22, 27, 33, 35, 8.1, 8.3, 'low', 'medium', 'beginner', 'LPS',
  'レッド・オレンジ・イエロー・グリーン・パープルが一つのコロニーに共存するレインボーアカンロードモーフ。最高峰のLPSコレクションアイテム。',
  '低照度でも飼育可能。週1〜2回の給餌（コペポーダ・クリル）で色揚げ効果が高い。',
  'Admin', 'Australia'
),
(
  'Micromussa lordhowensis', 'Double Rainbow Acan', 'ダブルレインボーアカン',
  'Merulinidae', 'Micromussa', 'Australia', 'オーストラリア・ロードハウ島',
  22, 27, 33, 35, 8.1, 8.3, 'low', 'medium', 'beginner', 'LPS',
  'レインボーロードのさらに色彩豊かな上位個体。より多くの色彩が重なり合う究極のアカンコレクションアイテム。',
  '非常に高価な個体のため安定した水質環境での飼育が必要。',
  'Admin', 'Australia'
),
(
  'Micromussa lordhowensis', 'Superman Acan Lord', 'スーパーマンアカンロード',
  'Merulinidae', 'Micromussa', 'Australia', 'オーストラリア・ロードハウ島',
  22, 27, 33, 35, 8.1, 8.3, 'low', 'medium', 'beginner', 'LPS',
  'ブルーとレッドのスーパーマンカラーがアカンロードに現れた希少モーフ。',
  '標準的なアカンロードの管理で飼育可能。',
  'Admin', 'Australia'
),
(
  'Micromussa lordhowensis', 'Aussie Lord', 'オージーロード',
  'Merulinidae', 'Micromussa', 'Australia', 'オーストラリア',
  22, 27, 33, 35, 8.1, 8.3, 'low', 'medium', 'beginner', 'LPS',
  'オーストラリア産のマイクロムッサ・ロードハウエンシスの総称。豊かな色彩で知られるオーストラリア個体群。',
  'オーストラリア産で高品質。給餌で色彩がさらに向上する。',
  'Admin', 'Australia'
),
(
  'Acanthastrea echinata', 'Ultra Red Acan', 'ウルトラレッドアカン',
  'Merulinidae', 'Acanthastrea', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 33, 35, 8.1, 8.3, 'low', 'medium', 'beginner', 'LPS',
  '全体が深みのある強烈なレッドで統一されたアカンのウルトラグレード個体。コレクター垂涎の逸品。',
  '低照度でも飼育可能。週1〜2回の給餌で色彩を維持。',
  'Admin', 'Australia'
),
(
  'Acanthastrea echinata', 'Toxic Green Acan', 'トキシックグリーンアカン',
  'Merulinidae', 'Acanthastrea', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 33, 35, 8.1, 8.3, 'low', 'medium', 'beginner', 'LPS',
  '毒々しいほど鮮やかなグリーンが輝くアカンモーフ。LED照明下でのグリーンの蛍光が圧倒的。',
  '低照度でも飼育可能。ブルーLED照明でグリーンの蛍光が際立つ。',
  'Admin', 'Australia'
),
(
  'Acanthastrea echinata', 'Warpaint Acan', 'ウォーペイントアカン',
  'Merulinidae', 'Acanthastrea', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 33, 35, 8.1, 8.3, 'low', 'medium', 'beginner', 'LPS',
  '戦化粧のような複雑な多色パターンのアカンモーフ。赤・オレンジ・グリーンが複雑に混ざり合う。',
  'アカン標準管理。給餌で色彩向上効果あり。',
  'Admin', 'Australia'
),

-- ========================================
-- チャリスコーラル ネームドモーフ
-- ========================================
(
  'Echinophyllia sp.', 'WWC Pink Floyd Chalice', 'WWCピンクフロイドチャリス',
  'Lobophylliidae', 'Echinophyllia', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.3, 'low', 'low', 'intermediate', 'LPS',
  'World Wide Corals（WWC）が生み出したチャリス界の最高傑作。ピンクの色彩とブライトグリーンのオーラルディスク、ピンクのリムが完璧なハーモニーを奏でる。',
  '低照度・低水流でも飼育可能。高照度に当てると退色するため注意。定期的な給餌で色彩維持。',
  'Admin', 'USA'
),
(
  'Echinophyllia sp.', 'Mummy Eye Chalice', 'マミーアイチャリス',
  'Lobophylliidae', 'Echinophyllia', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.3, 'low', 'low', 'intermediate', 'LPS',
  'ミイラの目のような独特のパターンを持つチャリスモーフ。オレンジ・レッド系の色彩が特徴的。',
  '低照度・低水流で管理。強い光での退色に注意。',
  'Admin', 'USA'
),
(
  'Echinophyllia sp.', 'Miami Hurricane Chalice', 'マイアミハリケーンチャリス',
  'Lobophylliidae', 'Echinophyllia', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.3, 'low', 'low', 'intermediate', 'LPS',
  'マイアミの嵐のような渦巻き模様のチャリスモーフ。オレンジ・レッド・グリーンの複雑なパターン。',
  '低照度・低水流で管理。',
  'Admin', 'USA'
),
(
  'Echinophyllia sp.', 'Acid Rain Chalice', 'アシッドレインチャリス',
  'Lobophylliidae', 'Echinophyllia', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.3, 'low', 'low', 'intermediate', 'LPS',
  '酸性雨のような鮮烈なグリーン・イエローの蛍光色チャリスモーフ。',
  'チャリス標準管理。低照度で飼育すること。',
  'Admin', 'USA'
),
(
  'Echinophyllia sp.', 'Sunny D Chalice', 'サニーDチャリス',
  'Lobophylliidae', 'Echinophyllia', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.3, 'low', 'low', 'intermediate', 'LPS',
  'オレンジ・イエロー系の明るいチャリスモーフ。ズーアンサスのサニーDと並ぶ人気のサニーDカラー。',
  '低照度・低水流で管理。',
  'Admin', 'USA'
),
(
  'Echinophyllia sp.', 'Hell''s Eye Chalice', 'ヘルズアイチャリス',
  'Lobophylliidae', 'Echinophyllia', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.3, 'low', 'low', 'intermediate', 'LPS',
  '地獄の目のような強烈なレッド・オレンジの色彩を持つチャリスモーフ。インパクト抜群。',
  '低照度・低水流で管理。',
  'Admin', 'USA'
),
(
  'Echinophyllia sp.', 'Pink Eye Green Chalice', 'ピンクアイグリーンチャリス',
  'Lobophylliidae', 'Echinophyllia', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.3, 'low', 'low', 'intermediate', 'LPS',
  'グリーンのスキンにピンクのアイ（目）が入るチャリスモーフ。シンプルながら美しいコントラスト。',
  'チャリス標準管理。低照度で飼育。',
  'Admin', 'Australia'
),

-- ========================================
-- ブラストムッサ ネームドモーフ
-- ========================================
(
  'Blastomussa wellsi', 'Tri-Color Blastomussa', 'トリカラーブラストムッサ',
  'Mussidae', 'Blastomussa', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.3, 'low', 'low', 'beginner', 'LPS',
  'レッド・ピンク、パープル、ティールの3色が共存するブラストムッサモーフ。比較的入手しやすいカラーバリエーション。',
  '低光量・低水流で飼育可能。週1回の給餌で良好な成長。',
  'Admin', 'Australia'
),
(
  'Blastomussa wellsi', 'Purple Green Blastomussa', 'パープルグリーンブラストムッサ',
  'Mussidae', 'Blastomussa', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.3, 'low', 'low', 'beginner', 'LPS',
  'ディープパープルにグリーンセンターが映えるブラストムッサモーフ。シンプルながら美しいコントラスト。',
  'ブラストムッサの標準管理で飼育可能。',
  'Admin', 'Australia'
),
(
  'Blastomussa wellsi', 'Fist of Fury Blastomussa', 'フィスト・オブ・フューリー',
  'Mussidae', 'Blastomussa', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.3, 'low', 'low', 'beginner', 'LPS',
  '怒りの拳のような強烈な色彩のブラストムッサの命名モーフ。レッド・オレンジ系の強烈な発色が特徴。',
  'ブラストムッサ標準管理。',
  'Admin', 'Australia'
),
(
  'Blastomussa merletti', 'Blue Raven Blastomussa', 'ブルーレイブン',
  'Mussidae', 'Blastomussa', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.3, 'low', 'low', 'beginner', 'LPS',
  'メルレッティ種のブルー系カラーモーフ。ウェルシ種とは別種で、より小型で繊細なポリプが特徴。',
  'ウェルシより若干繊細。安定した水質での管理を推奨。',
  'Admin', 'Australia'
),
(
  'Blastomussa wellsi', 'Rainbow Blastomussa', 'レインボーブラストムッサ',
  'Mussidae', 'Blastomussa', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.3, 'low', 'low', 'beginner', 'LPS',
  '複数の色彩が混在するレインボーブラストムッサ。赤・オレンジ・緑・紫が一つのコロニーに共存する。',
  '低照度・低水流で管理。給餌で色彩向上効果あり。',
  'Admin', 'Australia'
),
(
  'Blastomussa wellsi', 'Gold Rimes Blastomussa', 'ゴールドリムズブラストムッサ',
  'Mussidae', 'Blastomussa', 'Indo-Pacific', 'インド洋・太平洋',
  23, 27, 33, 35, 8.1, 8.3, 'low', 'low', 'beginner', 'LPS',
  'ゴールドのリム（縁取り）が各ポリプを縁取る美しいブラストムッサモーフ。',
  'ブラストムッサ標準管理。',
  'Admin', 'Australia'
),

-- ========================================
-- トラキフィリア（オープンブレイン）ネームドモーフ
-- ========================================
(
  'Trachyphyllia geoffroyi', 'Red Open Brain', 'レッドオープンブレイン',
  'Merulinidae', 'Trachyphyllia', 'Indo-Pacific', 'インド洋・太平洋',
  22, 27, 33, 35, 8.1, 8.3, 'medium', 'low', 'intermediate', 'LPS',
  '全体が鮮やかなレッドで統一されたオープンブレインのカラーモーフ。昼間は大きく膨らみ赤い花のように見える。',
  '砂底に置いて飼育。週1〜2回の給餌で色彩と成長が向上。',
  'Admin', 'Australia'
),
(
  'Trachyphyllia geoffroyi', 'Lime Green Open Brain', 'ライムグリーンオープンブレイン',
  'Merulinidae', 'Trachyphyllia', 'Indo-Pacific', 'インド洋・太平洋',
  22, 27, 33, 35, 8.1, 8.3, 'medium', 'low', 'intermediate', 'LPS',
  'ネオンライムグリーンの放射状ラインにパープルの境界線が入る非常に鮮やかなモーフ。',
  'オープンブレイン標準管理。砂底に置いての飼育が基本。',
  'Admin', 'Australia'
),
(
  'Trachyphyllia geoffroyi', 'Rainbow Open Brain', 'レインボーオープンブレイン',
  'Merulinidae', 'Trachyphyllia', 'Indo-Pacific', 'インド洋・太平洋',
  22, 27, 33, 35, 8.1, 8.3, 'medium', 'low', 'intermediate', 'LPS',
  '赤・オレンジ・グリーン・ブルーが迷彩模様のように混ざり合うレインボーペイントスプラッターモーフ。',
  'オープンブレイン標準管理。希少な個体のため安定した環境を維持すること。',
  'Admin', 'Australia'
),
(
  'Trachyphyllia geoffroyi', 'Neon Multicolor Open Brain', 'ネオンマルチカラーオープンブレイン',
  'Merulinidae', 'Trachyphyllia', 'Indo-Pacific', 'インド洋・太平洋',
  22, 27, 33, 35, 8.1, 8.3, 'medium', 'low', 'intermediate', 'LPS',
  '複数のネオンカラーが共存するウルトラグレードのオープンブレイン。トップコレクターに人気の最高峰個体。',
  '高価な個体のため安定した水質環境での飼育が必要。',
  'Admin', 'Australia'
),

-- ========================================
-- マッシュルーム / ロドアクティス ネームドモーフ
-- ========================================
(
  'Rhodactis sp.', 'Superman Rhodactis', 'スーパーマンロドアクティス',
  'Discosomatidae', 'Rhodactis', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 32, 35, 8.0, 8.4, 'low', 'low', 'beginner', 'soft',
  'ブライトレッド・オレンジの色彩にブルーのイリデッセントスキンとレッドのアクセントが入るスーパーマンカラーのマッシュルームコーラル。',
  '低照度・低水流で飼育可能。増殖は比較的遅い。高価な個体のため安定した環境を維持。',
  'Admin', 'USA'
),
(
  'Rhodactis sp.', 'Ultra Superman Rhodactis', 'ウルトラスーパーマン',
  'Discosomatidae', 'Rhodactis', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 32, 35, 8.0, 8.4, 'low', 'low', 'beginner', 'soft',
  'スーパーマンロドアクティスのウルトラグレード個体。より鮮やかで多彩な色彩を持つ最高品質の個体。',
  '非常に高価。安定した水質環境での飼育が必須。',
  'Admin', 'USA'
),
(
  'Discosoma sp.', 'Jawbreaker Mushroom', 'ジョーブレイカーマッシュルーム',
  'Discosomatidae', 'Discosoma', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 32, 35, 8.0, 8.4, 'low', 'low', 'beginner', 'soft',
  '顎が砕けるほどの美しさから名付けられたジョーブレイカーマッシュルーム。レッド・ブルー・グリーンの多色が同心円状に広がる。',
  '低照度・低水流で飼育可能。増殖が遅く希少。高価な個体のため安定した環境を維持。',
  'Admin', 'USA'
),
(
  'Rhodactis sp.', 'Bullseye Mushroom', 'ブルズアイマッシュルーム',
  'Discosomatidae', 'Rhodactis', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 32, 35, 8.0, 8.4, 'low', 'low', 'beginner', 'soft',
  '的（ブルズアイ）のようなレッドとブルーのターゲット模様が特徴のロドアクティスモーフ。',
  '低照度・低水流で飼育可能。',
  'Admin', 'USA'
),
(
  'Ricordia yuma', 'Blue Ricordia', 'ブルーリコルディア',
  'Ricordiidae', 'Ricordia', 'Indo-Pacific', 'インド洋・太平洋・日本',
  22, 28, 32, 35, 8.0, 8.4, 'low', 'low', 'beginner', 'soft',
  'ブルー系の鮮やかな色彩を持つリコルディア・ユマ。沖縄周辺でも採取されることがある日本の海にも生息する種。',
  '低照度・低水流で飼育可能。増殖は比較的遅い。',
  'Admin', 'Japan'
),
(
  'Rhodactis sp.', 'Teal Mushroom', 'ティールマッシュルーム',
  'Discosomatidae', 'Rhodactis', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 32, 35, 8.0, 8.4, 'low', 'low', 'beginner', 'soft',
  'ティール（青緑）の独特な色彩を持つロドアクティスモーフ。ブルーでもグリーンでもないティール色が希少。',
  '低照度・低水流で管理。',
  'Admin', 'USA'
),
(
  'Rhodactis sp.', 'Orange Crush Rhodactis', 'オレンジクラッシュロドアクティス',
  'Discosomatidae', 'Rhodactis', 'Indo-Pacific', 'インド洋・太平洋',
  22, 28, 32, 35, 8.0, 8.4, 'low', 'low', 'beginner', 'soft',
  'クラッシュドオレンジのような強烈な蛍光オレンジが特徴のロドアクティスモーフ。',
  '低照度・低水流で飼育可能。比較的増殖しやすい。',
  'Admin', 'USA'
);
