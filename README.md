# Aqua Reef Log

海水水槽の水質管理とサンゴデータベースを統合するNext.jsアプリです。

## Setup

1. Supabaseでプロジェクトを作成します。
2. Supabase SQL editorで次のSQLを順番に実行します。
   - `supabase-setup.sql`
   - `coral-named-morphs.sql`
   - `coral-additional-data.sql`
   - `aquarium-water-quality.sql`
3. `.env.local.example` を参考に `.env.local` を作成します。

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
```

4. 依存関係を入れて開発サーバーを起動します。

```bash
npm install
npm run dev
```

## Features

- サンゴ一覧・詳細表示
- サンゴカテゴリ、名前、ショップ名での検索
- 水温、比重、pH、KH、Ca、Mg、NO3、PO4の測定ログ
- Supabaseへの水質ログ保存
- 最新測定値の推奨範囲チェック

## Notes

現在はログインなしのMVPです。`aquarium-water-quality.sql` では匿名ユーザーの読み書きを許可しています。公開運用する場合はSupabase Authを追加し、RLSポリシーをユーザー単位に絞ってください。
