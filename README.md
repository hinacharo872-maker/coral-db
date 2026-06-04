# Aqua Reef Log

海水水槽の水質管理とサンゴデータベースを統合するNext.jsアプリです。

## Local setup

`.env.local.example` を参考に `.env.local` を作成します。

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
```

依存関係を入れて開発サーバーを起動します。

```bash
npm install
npm run dev
```

## Automated production deployment

SupabaseとVercelのGitHub統合を使います。GitHub Actions用のトークンやデータベースパスワードは不要です。

Supabase Dashboardの `Project Settings > Integrations > GitHub Integration` で次を設定してください。

- Repository: `hinacharo872-maker/coral-db`
- Production branch: `main`
- Working directory: `.`
- Deploy to production: On
- Automatic branching: 必要に応じてOn

`main` にpushまたはマージすると、Supabaseが `supabase/migrations` 内の新しいmigrationを本番DBへ自動適用します。

Vercelでは対象プロジェクトの `Settings > Git` で同じGitHubリポジトリと `main` ブランチを接続してください。`main` へのpushでVercel Productionが自動デプロイされます。

Vercelプロジェクト側には、Production環境変数として次を登録してください。

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Database migrations

今後のスキーマ変更は、Supabase DashboardのSQL editorへ直接適用せず、`supabase/migrations` に新しいSQLファイルを追加してください。

```text
supabase/migrations/YYYYMMDDHHMMSS_description.sql
```

ルート直下の既存SQLファイルは、以前の手動セットアップ・データ投入用です。自動デプロイでは実行されません。

## Features

- サンゴ一覧・詳細表示
- サンゴカテゴリ、名前、ショップ名での検索
- 水温、比重、pH、KH、Ca、Mg、NO3、PO4の測定ログ
- Supabaseへの水質ログ保存
- 最新測定値の推奨範囲チェック

## Security note

現在はログインなしのMVPです。初期migrationでは匿名ユーザーの水質ログ読み書きを許可しています。公開運用を拡大する場合はSupabase Authを追加し、RLSポリシーをユーザー単位に絞ってください。
