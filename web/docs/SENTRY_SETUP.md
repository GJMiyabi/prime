# Sentry セットアップガイド

## ✅ 完了した設定

[.env.local](../../../.env.local)に以下の設定を追加しました：

```env
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development
# NEXT_PUBLIC_SENTRY_DSN=（コメントアウト済み）
```

## 🚀 Sentryを有効化する手順

### 1. Sentryアカウント作成

1. https://sentry.io にアクセス
2. 「Sign Up」からアカウント作成（GitHubアカウントで登録可能）
3. 無料プランで開始（月10,000イベントまで無料）

### 2. プロジェクト作成

1. ダッシュボードで「Create Project」をクリック
2. **Platform**: `Next.js` を選択
3. **Project Name**: `your-app-name`（任意の名前）
4. **Alert Frequency**: `On every new issue`（推奨）
5. 「Create Project」をクリック

### 3. DSNの取得

プロジェクト作成後、以下のような形式のDSNが表示されます：

```
https://examplePublicKey@o0.ingest.sentry.io/0
```

このDSNをコピーします。

### 4. .env.localに設定

[.env.local](../../../.env.local)を開いて、以下の行のコメントを外してDSNを貼り付け：

```env
# Before
# NEXT_PUBLIC_SENTRY_DSN=

# After
NEXT_PUBLIC_SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
```

### 5. 開発サーバーを再起動

```bash
npm run dev
```

### 6. 動作確認（テストエラーを発生させる）

任意のページで以下のコードを実行してエラーを発生させます：

```typescript
// pages/test-error.tsx など
"use client";

export default function TestError() {
  const triggerError = () => {
    throw new Error("Sentryテストエラー");
  };

  return (
    <div>
      <h1>Sentryテスト</h1>
      <button onClick={triggerError}>
        エラーを発生させる
      </button>
    </div>
  );
}
```

ボタンをクリックすると：
- Error Boundaryがエラーをキャッチ
- 開発環境ではコンソールにログ出力
- 本番環境ではSentryに自動送信

### 7. Sentryダッシュボードで確認

本番環境（`NEXT_PUBLIC_SENTRY_ENVIRONMENT=production`）でエラーを発生させると、Sentryダッシュボードに表示されます：

1. https://sentry.io にログイン
2. プロジェクトを選択
3. 「Issues」タブでエラー一覧を確認

---

## 🔧 本番環境での設定

### Vercelにデプロイする場合

1. Vercelダッシュボード → プロジェクト → Settings → Environment Variables
2. 以下の環境変数を追加：

```
NEXT_PUBLIC_SENTRY_DSN=https://...
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### ソースマップのアップロード（オプション）

エラー発生時にソースコードの正確な位置を表示するには：

1. Sentryで「Auth Token」を作成
   - Settings → Account → API → Auth Tokens
   - 権限: `project:read`, `project:releases`, `org:read`

2. `.env.local`（または本番環境変数）に追加：

```env
SENTRY_AUTH_TOKEN=your-auth-token
SENTRY_ORG=your-org-name
SENTRY_PROJECT=your-project-name
```

3. ビルド時に自動的にソースマップがアップロードされます

---

## 📊 Sentryの主な機能

### 1. エラートラッキング
- エラーの自動収集
- スタックトレース
- ブレッドクラム（エラー発生前の操作履歴）

### 2. パフォーマンス監視
- ページロード時間
- APIレスポンス時間
- トランザクション追跡

### 3. セッションリプレイ
- ユーザーの操作を動画として記録
- エラー発生時の状況を再現
- 個人情報は自動マスク

### 4. アラート
- Slack通知
- Email通知
- 新しいエラー発生時に即座に通知

---

## ⚠️ 注意事項

### 開発環境での動作

現在の設定では、開発環境（`NODE_ENV=development`）ではSentryにエラーを送信せず、コンソールにログ出力します：

```typescript
// logger.ts
if (CONFIG.IS_DEVELOPMENT) {
  console.warn("[Sentry] 開発環境のためイベントは送信されません:", event);
  return null;
}
```

これにより、開発中に不要なエラーがSentryに蓄積されるのを防ぎます。

### セキュリティ

- **DSNは公開情報**: `NEXT_PUBLIC_SENTRY_DSN`はクライアントサイドで使用されるため、公開されます
- **プロジェクト設定**: Sentry側で「Allowed Domains」を設定して不正利用を防止できます
- **Auth Token**: `SENTRY_AUTH_TOKEN`は機密情報なので`.env.local`には含めず、CI/CDでのみ使用

### 無料プランの制限

- 月10,000イベントまで
- 1プロジェクトまで
- 7日間のデータ保持

超過する場合は有料プランへのアップグレードが必要です。

---

## 🎯 現在の状態

- ✅ Sentry統合コード実装済み
- ✅ Error Boundary実装済み
- ✅ logger.ts統合済み
- ✅ 環境変数設定済み（DSN未設定）
- ⏳ **次のステップ**: Sentryアカウント作成 → DSN設定

開発環境では既に動作しており、Sentryを有効化しなくてもエラーバウンダリとロガーは正常に機能します。
