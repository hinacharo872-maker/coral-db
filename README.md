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

`main` ブランチへのpushで、GitHub Actionsが次の順番で本番反映します。

1. `supabase/migrations` をSupabaseへ適用
2. Vercelの本番設定を取得
3. Next.jsをビルド
4. Vercel Productionへデプロイ

GitHubリポジトリの `Settings > Secrets and variables > Actions` に、次のRepository secretsを登録してください。

| Secret | 取得場所 |
| --- | --- |
| `SUPABASE_ACCESS_TOKEN` | Supabase Account Settings > Access Tokens |
| `SUPABASE_DB_PASSWORD` | Supabase Project Settings > Database |
| `SUPABASE_PROJECT_REF` | Supabase Project Settings > General |
| `VERCEL_TOKEN` | Vercel Account Settings > Tokens |
| `VERCEL_ORG_ID` | Vercel Team Settings、または `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Vercel Project Settings、または `.vercel/project.json` |

Vercelプロジェクト側には、Production環境変数として次を登録してください。

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

GitHub ActionsからVercelをデプロイするため、VercelのGit自動デプロイも有効だと二重デプロイになります。Actionsへ切り替えた後は、Vercel Project SettingsのGit連携を解除してください。

ワークフローは `.github/workflows/deploy-production.yml` にあります。手動実行もGitHub Actions画面の `Run workflow` から可能です。

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
