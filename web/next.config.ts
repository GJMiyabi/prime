import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

// Sentry設定でラップ
export default withSentryConfig(nextConfig, {
  // Sentryプロジェクト設定
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // ソースマップのアップロード設定
  silent: true, // ビルド時のログを抑制

  // Source mapsのアップロード（本番ビルドのみ）
  widenClientFileUpload: true,
  
  // Turbopackモードでは一部オプションが未対応のため最小限の設定
});
