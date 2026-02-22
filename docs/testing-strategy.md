# テスト戦略

## 🎯 目標

| 期間 | カバレッジ目標 | 対象 |
|------|--------------|------|
| **フェーズ1** (導入直後) | 40% | クリティカルパス（認証、CRUD） |
| **フェーズ2** (3ヶ月) | 60% | ドメインロジック、ユースケース |
| **フェーズ3** (6ヶ月) | **80%** | 全体（インフラ層含む） |

---

## 📊 カバレッジ指標

### 最小要件（PR マージ条件）
```yaml
Lines:     60%  # 行カバレッジ
Branches:  60%  # 分岐カバレッジ
Functions: 60%  # 関数カバレッジ
Statements: 60% # ステートメントカバレッジ
```

### 目標値（6ヶ月後）
```yaml
Lines:     80%
Branches:  75%
Functions: 80%
Statements: 80%
```

---

## 🏗️ テスト構造

### 1. **Unit Test** - 最優先
- **対象**: 単一の関数・クラス・コンポーネント
- **ツール**: 
  - Frontend: Vitest + React Testing Library
  - Backend: Jest + @nestjs/testing
- **カバレッジ目標**: 80%

#### 優先順位
1. **Critical (P0)** - 認証・認可ロジック
   - `@/usecases/auth/*`
   - `@/guards/*`, `@/decorators/*`
   - JWT検証、CSRF保護
   
2. **High (P1)** - ビジネスロジック
   - `@/usecases/person/*`, `@/usecases/facility/*`
   - ドメインエンティティ
   - バリデーション（Pipes）
   
3. **Medium (P2)** - UI コンポーネント
   - `@/components/common/*`
   - フォーム、バリデーション
   - エラーハンドリング
   
4. **Low (P3)** - インフラ層
   - Repositories
   - HTTP Clients
   - Prisma adapters

---

### 2. **Integration Test**
- **対象**: 複数モジュールの統合
- **ツール**: 
  - Backend: Jest + Supertest
  - Frontend: Vitest + MSW (Mock Service Worker)
- **カバレッジ目標**: 60%

#### テストケース例
- GraphQL Resolver + UseCase + Repository
- Apollo Client + GraphQL queries/mutations
- Authentication flow (login → JWT → protected route)
- Form submission → Validation → API call

---

### 3. **E2E Test**
- **対象**: ユーザーシナリオ
- **ツール**: Playwright（推奨）
- **カバレッジ目標**: 主要ユーザーフロー 100%

#### 必須シナリオ
- [ ] ログイン → ダッシュボード表示
- [ ] Person 作成 → 一覧表示 → 詳細表示
- [ ] Organization 作成 → Person紐付け
- [ ] エラーハンドリング（認証失敗、バリデーションエラー）

---

## 🛠️ 技術スタック

### Frontend (web/)
```json
{
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest run --coverage"
}
```

**依存関係**:
- `vitest` - テストランナー
- `@vitest/coverage-v8` - カバレッジレポート
- `@testing-library/react` - React コンポーネントテスト
- `@testing-library/user-event` - ユーザーインタラクション
- `msw` - API モック

### Backend (api/)
```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:cov": "jest --coverage",
  "test:e2e": "jest --config ./test/jest-e2e.json"
}
```

**既存**: Jest は既に設定済み

---

## 📝 テストガイドライン

### Naming Convention
```typescript
// ✅ Good
describe('AuthService', () => {
  describe('login', () => {
    it('should return JWT token when credentials are valid', () => {});
    it('should throw UnauthorizedException when password is invalid', () => {});
  });
});

// ❌ Bad
describe('test', () => {
  it('works', () => {});
});
```

### AAA パターン
```typescript
it('should create a person', async () => {
  // Arrange (準備)
  const input = { name: 'John Doe', email: 'john@example.com' };
  
  // Act (実行)
  const result = await personService.create(input);
  
  // Assert (検証)
  expect(result.id).toBeDefined();
  expect(result.name).toBe('John Doe');
});
```

### モックの原則
1. **外部依存は必ずモック**
   - HTTP calls (axios, fetch)
   - Database (Prisma)
   - External APIs
   
2. **Pure functions はモック不要**
   - バリデーション関数
   - 計算ロジック
   
3. **モックの統一パターン**
   - `__mocks__/` ディレクトリに集約
   - 再利用可能なファクトリー関数

---

## 🚀 CI/CD 統合

### GitHub Actions
```yaml
name: Test & Coverage

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v4  # カバレッジアップロード
```

### PR チェック条件
- [ ] All tests pass
- [ ] Coverage ≥ 60% (Lines, Branches, Functions, Statements)
- [ ] No new code without tests (新規コードはカバレッジ必須)

---

## 📈 モニタリング

### カバレッジバッジ
```markdown
[![Coverage](https://codecov.io/gh/YOUR_ORG/YOUR_REPO/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_ORG/YOUR_REPO)
```

### 定期レビュー
- **週次**: カバレッジレポート確認
- **月次**: テストスイート実行時間最適化
- **四半期**: テスト戦略見直し

---

## 🎬 アクションプラン

### Week 1-2: 基盤構築
- [x] テスト戦略文書作成
- [ ] カバレッジツール導入
- [ ] CI/CD パイプライン設定
- [ ] テストガイドライン作成

### Week 3-4: Critical Tests (P0)
- [ ] AuthService unit tests
- [ ] GqlAuthGuard, RolesGuard tests
- [ ] CSRF Guard tests
- [ ] JWT verification tests
- **目標**: 40% カバレッジ

### Month 2: High Priority Tests (P1)
- [ ] Person UseCase tests
- [ ] Facility UseCase tests
- [ ] Domain entities tests
- [ ] Validation Pipe tests
- **目標**: 60% カバレッジ

### Month 3-6: Full Coverage (P2-P3)
- [ ] Frontend component tests
- [ ] Integration tests
- [ ] E2E tests (Playwright)
- [ ] Repository tests
- **目標**: 80% カバレッジ

---

## 📚 参考資料

- [Testing Best Practices](https://testingjavascript.com/)
- [Vitest Documentation](https://vitest.dev/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [React Testing Library](https://testing-library.com/react)
