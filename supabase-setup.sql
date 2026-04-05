-- ========================================
-- World Coral Database — Supabase セットアップ
-- coral_master_list テーブル定義
-- (実テーブルスキーマに同期: 2026-04-05)
-- ========================================

CREATE TABLE coral_master_list (
  id               SERIAL PRIMARY KEY,
  trade_name       TEXT,                              -- トレード名
  brand_prefix     TEXT,                              -- ブランドプレフィックス (JF / WWC など)
  genus            TEXT,                              -- 属名
  species          TEXT,                              -- 種小名
  coral_category   TEXT,                              -- SPS / LPS / Soft / Zoanthid など
  source_shop      TEXT,                              -- 入手元ショップ名
  common_name_jp   TEXT,                              -- 日本語通称
  temperature      NUMERIC(4,1),                      -- 飼育水温 °C
  salinity         NUMERIC(5,3),                      -- 比重 (例: 1.025)
  kh               NUMERIC(4,1),                      -- KH (炭酸硬度) dKH
  calcium          NUMERIC(6,1),                      -- カルシウム濃度 ppm
  magnesium        NUMERIC(6,1),                      -- マグネシウム濃度 ppm
  nitrate          NUMERIC(6,2),                      -- 硝酸塩濃度 ppm
  phosphate        NUMERIC(6,3),                      -- リン酸塩濃度 ppm
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- セキュリティ設定（全員が閲覧可能、書き込みは管理者のみ）
ALTER TABLE coral_master_list ENABLE ROW LEVEL SECURITY;

CREATE POLICY "全員が閲覧可能" ON coral_master_list
  FOR SELECT USING (true);
