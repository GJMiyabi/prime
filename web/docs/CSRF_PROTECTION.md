# CSRF対策実装ガイド

## 概要

CSRF（Cross-Site Request Forgery）攻撃から保護するため、**Double Submit Cookie パターン**を実装しました。

## CSRF攻撃とは

攻撃者が被害者のブラウザを利用して、被害者が認証済みのサイトに対して意図しないリクエストを送信させる攻撃手法です。

### 攻撃例

```
1. ユーザーが銀行サイトにログイン（認証Cookie保存）
2. 攻撃者が悪意のあるサイトに誘導
3. 悪意のあるサイトから銀行サイトへリクエスト送信
   → ブラウザが自動的に認証Cookieを付与
4. 銀行サイトは正規リクエストと判断して処理実行
```

## 実装したCSRF対策

### Double Submit Cookie パターン

1. **サーバー側でトークン生成**
   - 暗号学的に安全な256ビットランダム値
   - 有効期限: 1時間

2. **トークンを2箇所に保存**
   - Cookie（`csrf_token`）：`httpOnly: false`でクライアント読み取り可能
   - HTTPヘッダー（`x-csrf-token`）：リクエスト時にクライアントが付与

3. **サーバー側で両者を比較**
   - Cookie と ヘッダーが一致 → 正規リクエスト
   - 不一致 or 欠落 → CSRF攻撃の可能性

### なぜこれで防げるのか

攻撃者のサイトから送信されたリクエストでは：
- ✅ Cookie は自動付与される（ブラウザの仕様）
- ❌ HTTPヘッダーは付与できない（Same-Origin Policy）

→ Cookie と ヘッダーが一致しない = 攻撃

## ファイル構成

```
web/src/
├── middleware.ts ............................ Next.js Middleware（CSRF検証）
├── app/
│   ├── _lib/
│   │   ├── csrf.server.ts .................. サーバー専用（トークン生成・検証）
│   │   ├── csrf.client.ts .................. クライアント専用（Cookie読み取り）
│   │   └── api-client.ts ................... フェッチラッパー（自動トークン付与）
│   ├── _hooks/
│   │   └── useLogout.ts .................... apiClient使用例
│   └── api/
│       └── auth/
│           ├── csrf/route.ts ............... CSRFトークン取得エンドポイント
│           ├── login/route.ts .............. ログイン（CSRF除外）
│           └── logout/route.ts ............. ログアウト（CSRF保護）
```

## 実装詳細

### 1. サーバー側：トークン生成 (`csrf.server.ts`)

```typescript
import { randomBytes } from "crypto";

export function generateCSRFToken(): string {
  return randomBytes(32).toString("base64url");
}

export async function setCSRFCookie(token: string): Promise<void> {
  cookieStore.set({
    name: "csrf_token",
    value: token,
    httpOnly: false,    // ← クライアントから読み取り可能
    secure: production,
    sameSite: "strict", // ← CSRF対策
    maxAge: 3600,
  });
}
```

### 2. トークン取得エンドポイント (`api/auth/csrf/route.ts`)

```typescript
export async function GET() {
  const token = generateCSRFToken();
  await setCSRFCookie(token);
  
  return NextResponse.json({ token, expiresIn: 3600 });
}
```

### 3. Middleware でCSRF検証 (`middleware.ts`)

```typescript
export async function middleware(request: NextRequest) {
  // POST/PUT/DELETE/PATCH のみ検証
  if (!isCSRFProtectedMethod(request.method)) {
    return NextResponse.next();
  }

  // /api/auth/login は除外（初回アクセス）
  if (CSRF_EXEMPT_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Cookie と ヘッダーのトークンを比較
  const isValid = await verifyCSRFToken(request);
  
  if (!isValid) {
    return NextResponse.json(
      { error: "CSRF検証に失敗しました" },
      { status: 403 }
    );
  }

  return NextResponse.next();
}
```

### 4. クライアント側：自動トークン付与 (`api-client.ts`)

```typescript
// CSRFトークンを取得（Cookie or サーバーから）
async function getCSRFToken(): Promise<string | null> {
  let token = getCSRFTokenFromCookie();
  if (!token) {
    token = await fetchCSRFToken();
  }
  return token;
}

// POST/PUT/DELETE/PATCH に自動付与
export const apiClient = {
  async post(url: string, body?: unknown) {
    const token = await getCSRFToken();
    
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": token, // ← 自動付与
      },
      credentials: "include",
      body: JSON.stringify(body),
    });
  },
};
```

### 5. アプリケーションでの使用例 (`useLogout.ts`)

```typescript
import { apiClient } from "../_lib/api-client";

export function useLogout() {
  const executeLogout = async () => {
    // apiClient が自動的に CSRF トークンを付与
    await apiClient.post("/api/auth/logout");
    
    setUser(null);
    router.push("/login");
  };

  return { executeLogout };
}
```

## セキュリティ特性

### ✅ 実装済み

| 項目 | 実装内容 |
|------|---------|
| **トークン生成** | 暗号学的に安全な256ビットランダム値（`crypto.randomBytes`）|
| **トークン検証** | タイミング攻撃対策（定数時間比較）|
| **Cookie属性** | `sameSite: strict`、`secure: production` |
| **有効期限** | 1時間（トークンリフレッシュ可能）|
| **除外パス** | `/api/auth/csrf`, `/api/auth/login` |
| **保護対象** | POST, PUT, DELETE, PATCH |

### 🔒 攻撃対策

| 攻撃手法 | 対策 |
|---------|-----|
| **CSRF攻撃** | ✅ Double Submit Cookie / Same-Origin Policy |
| **トークン推測** | ✅ 256ビット暗号学的ランダム値 |
| **タイミング攻撃** | ✅ 定数時間文字列比較 |
| **Cookie窃取** | ✅ `sameSite: strict` |
| **中間者攻撃** | ✅ `secure: true`（本番環境）|

## 使用方法

### 基本的な使い方

```typescript
// ❌ 直接 fetch を使う（CSRF保護なし）
await fetch("/api/users", {
  method: "POST",
  body: JSON.stringify({ name: "John" }),
});

// ✅ apiClient を使う（自動CSRF保護）
import { apiClient } from "@/app/_lib/api-client";

await apiClient.post("/api/users", { name: "John" });
```

### CSRFトークンの手動取得（必要な場合）

```typescript
// 通常は apiClient が自動処理するため不要
const response = await fetch("/api/auth/csrf");
const { token } = await response.json();

// 手動でヘッダーに含める
await fetch("/api/some-endpoint", {
  method: "POST",
  headers: {
    "x-csrf-token": token,
  },
  credentials: "include",
});
```

## トラブルシューティング

### 403 Forbidden: CSRF検証失敗

**原因1: トークンが取得されていない**
```typescript
// ログイン後、CSRFトークンが自動取得されているか確認
document.cookie.split("; ").find(c => c.startsWith("csrf_token="));
```

**原因2: apiClient を使っていない**
```typescript
// ❌ 直接fetch
await fetch("/api/logout", { method: "POST" });

// ✅ apiClient経由
await apiClient.post("/api/logout");
```

**原因3: Cookieが送信されていない**
```typescript
// credentials: "include" を必ず指定
fetch(url, { credentials: "include" });
```

### トークンの有効期限切れ

CSRFトークンは1時間で期限切れ。apiClientが自動的に再取得します。

```typescript
// api-client.ts内で自動的に処理される
async function getCSRFToken() {
  let token = getCSRFTokenFromCookie();
  if (!token) {
    token = await fetchCSRFToken(); // ← 自動再取得
  }
  return token;
}
```

## 次のステップ

CSRF対策は **Level 2: セキュリティ基礎** の一部です。

次の実装候補：
1. **RBAC（役割ベースアクセス制御）**
2. **入力サニタイゼーション強化**
3. **レート制限（Brute Force対策）**

---

**実装日**: 2026年2月22日  
**バージョン**: 1.0.0  
**セキュリティレベル**: Level 2 達成中
