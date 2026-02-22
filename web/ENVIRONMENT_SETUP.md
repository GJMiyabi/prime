# 環境変数設定ガイド

## 概要

このプロジェクトでは、環境ごとに異なる設定を環境変数で管理しています。

## セットアップ手順

### 1. 開発環境

`.env.example` をコピーして `.env.local` を作成してください：

```bash
cd web
cp .env.example .env.local
```

### 2. 環境変数の編集

`.env.local` を開いて、必要に応じて値を変更してください：

```bash
# GraphQL API Endpoint
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
```

### 3. 本番環境

`.env.production` ファイルには本番環境用の設定を記述します：

```bash
# 本番環境のGraphQL APIエンドポイント
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://api.production.example.com/graphql
```

## 環境変数一覧

| 変数名 | 説明 | デフォルト値 |
|--------|------|--------------|
| `NEXT_PUBLIC_GRAPHQL_ENDPOINT` | GraphQL APIのエンドポイントURL | `http://localhost:4000/graphql` |

## 注意事項

### ⚠️ セキュリティ

- **`.env.local` はGitにコミットしないでください**
  - すでに `.gitignore` に `.env*` が含まれているため、自動的に除外されます
- `.env.example` のみをコミットしてください（テンプレートとして）

### 📝 Next.jsの環境変数ルール

- **`NEXT_PUBLIC_` プレフィックス**: ブラウザ側で使用する環境変数には必須
- プレフィックスなし: サーバーサイドでのみ使用可能
- 環境変数の変更後は開発サーバーを再起動してください

## ファイル構成

```
web/
├── .env.local          # 開発環境用（Git管理外）
├── .env.production     # 本番環境用（Git管理外）
├── .env.example        # テンプレート（Gitにコミット）
└── src/
    └── app/
        └── _constants/
            └── config.ts  # 設定を読み込むファイル
```

## 使用方法

コード内では `CONFIG` オブジェクトを使用してアクセスします：

```typescript
import { CONFIG } from "@/app/_constants/config";

// GraphQL エンドポイントを取得
const endpoint = CONFIG.GRAPHQL_ENDPOINT;
```

## トラブルシューティング

### 環境変数が反映されない

1. 開発サーバーを再起動してください
   ```bash
   npm run dev
   # または
   yarn dev
   ```

2. `.env.local` ファイルが存在するか確認
   ```bash
   ls -la .env*
   ```

3. 環境変数の名前が正しいか確認
   - `NEXT_PUBLIC_` プレフィックスがあるか
   - スペルミスがないか

### 警告が表示される

開発環境で以下の警告が表示されることがありますが、正常です：

```
⚠️  NEXT_PUBLIC_GRAPHQL_ENDPOINT is not set. Using default: http://localhost:4000/graphql
```

これは `.env.local` が設定されていない場合のフォールバック動作です。

## 環境別の動作

| 環境 | 使用されるファイル | ビルドコマンド |
|------|-------------------|----------------|
| 開発環境 | `.env.local` | `npm run dev` |
| 本番環境 | `.env.production` | `npm run build` |
| テスト環境 | `.env.test` | `npm run test` |

## 新しい環境変数の追加

新しい環境変数を追加する場合：

1. `.env.example` に追加（コメント付き）
2. `.env.local` に追加
3. `config.ts` に定義を追加
4. このREADMEを更新

例：

```typescript
// config.ts
export const CONFIG = {
  GRAPHQL_ENDPOINT: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "...",
  API_TIMEOUT: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 30000,
} as const;
```
