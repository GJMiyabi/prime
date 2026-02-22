# アーキテクチャ分析レポート

## 現状の設計比較

### 🔐 Auth機能（クリーンアーキテクチャ採用）

```
UI Component
    ↓
📱 useLogin.ts (Hooks層 - フレームワーク層)
    ↓
🎯 LoginUseCase (ユースケース層 - ビジネスロジック)
    ↓
📦 IAuthRepository → GraphQLAuthRepository (リポジトリ層 - データアクセス)
    ↓
🌐 GraphQL API
```

**特徴:**
- ✅ 責任の明確な分離
- ✅ インターフェースによる依存性の逆転（DIP）
- ✅ テスト容易性が高い
- ✅ ビジネスロジックの再利用が可能
- ✅ バックエンドのクリーンアーキテクチャと整合

**ファイル構成:**
```
_repositories/
  └── auth.repository.ts       # IAuthRepository, GraphQLAuthRepository
_usecases/
  └── auth/
      ├── login.usecase.ts      # LoginUseCase
      ├── logout.usecase.ts     # LogoutUseCase
      ├── redirect.usecase.ts   # リダイレクトロジック
      └── jwt.utils.ts          # トークンデコード
_hooks/
  ├── useLogin.ts               # ログインフック
  └── useLogout.ts              # ログアウトフック
```

---

### 👤 Person機能（シンプルアプローチ）

```
UI Component
    ↓
📱 usePersonCreateForm.ts (カスタムフック)
    ↓
📱 useCreateSinglePerson.ts (Apollo Clientラッパー)
    ↓
🌐 GraphQL API (mutations/queries直接定義)
```

**特徴:**
- ⚠️ Repository層が存在しない
- ⚠️ UseCase層が存在しない
- ⚠️ Apollo Clientに直接依存
- ⚠️ ビジネスロジックがHooksに混在
- ⚠️ バックエンドとの設計不整合

**ファイル構成:**
```
_hooks/
  └── person/
      ├── form/
      │   ├── index.ts                      # useCreateSinglePerson
      │   ├── usePersonCreateForm.ts        # フォームロジック
      │   ├── mutations/mutations.ts        # GraphQL mutation定義
      │   └── queries/queries.ts            # GraphQL query定義
      └── get/
          └── index.ts                      # useGetPerson
```

---

## 🔍 問題点の詳細

### 1. **アーキテクチャの不統一**
- Auth機能はクリーンアーキテクチャ
- Person機能はSimple Hooks Pattern
- → チーム内で混乱、保守性低下

### 2. **ビジネスロジックの所在が不明確**
```typescript
// usePersonCreateForm.ts - ビジネスロジックがHooksに混在
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();  // UI関心事
  
  const { data, error: submitError } = await createPerson(name, value);  // データアクセス
  
  if (submitError) {
    console.error(submitError);  // エラーハンドリング
    return;
  }
  
  if (data?.createSinglePerson) {
    const created = data.createSinglePerson;
    router.push(`/person/${created.id}`);  // ルーティング
  }
};
```
**問題:** フォームハンドリング、データアクセス、エラーハンドリング、ルーティングが1箇所に集中

### 3. **テストの難しさ**
```typescript
// Person機能: Apollo Clientに直接依存 → モックが複雑
const [createPersonMutation, { data, loading, error }] = useMutation<
  CreateSinglePersonData,
  CreateSinglePersonVars
>(CREATE_SINGLE_PERSON);

// Auth機能: インターフェースで分離 → モックが簡単
const loginUseCase = new LoginUseCase(mockAuthRepository);
```

### 4. **バックエンドとの設計ギャップ**
バックエンド（API側）はクリーンアーキテクチャを採用:
```
api/src/
  ├── domains/              # エンティティ、リポジトリインターフェース
  ├── usecases/             # ビジネスロジック（Interactor）
  ├── interface-adapters/   # リポジトリ実装
  └── frameworks/           # NestJS、Prisma
```

フロントエンドのPerson機能はこの構造と対応していない。

---

## 💡 推奨される統一アーキテクチャ

### オプション1: **クリーンアーキテクチャに統一（推奨）**

#### メリット
✅ バックエンドと整合性が取れる
✅ ビジネスロジックの再利用が容易
✅ テストが書きやすい
✅ 大規模プロジェクトに対応可能
✅ チーム開発での明確な責任分離

#### デメリット
❌ ボイラープレートコードが増える
❌ 小規模な変更でも複数ファイル編集が必要
❌ 学習コストがかかる

#### 実装構造
```
web/src/app/
  ├── _repositories/
  │   ├── auth.repository.ts
  │   └── person.repository.ts          # 新規作成
  ├── _usecases/
  │   ├── auth/
  │   │   ├── login.usecase.ts
  │   │   └── logout.usecase.ts
  │   └── person/                       # 新規作成
  │       ├── create-person.usecase.ts
  │       └── get-person.usecase.ts
  ├── _hooks/
  │   ├── auth/
  │   │   ├── useLogin.ts
  │   │   └── useLogout.ts
  │   └── person/
  │       ├── usePersonCreate.ts
  │       └── usePersonGet.ts
  └── person/
      └── _components/
          └── form/
              └── create/
                  └── index.tsx         # UI専念
```

---

### オプション2: **シンプルパターンに統一**

#### メリット
✅ コード量が少ない
✅ 開発速度が速い
✅ 学習コストが低い
✅ 小〜中規模プロジェクトに最適

#### デメリット
❌ ビジネスロジックが分散
❌ テストが複雑化
❌ バックエンドとの設計ギャップ
❌ 大規模化に対応しづらい

#### 実装構造
Auth機能もPerson機能と同じパターンに書き直す
```
web/src/app/
  ├── _hooks/
  │   ├── auth/
  │   │   ├── useLogin.ts               # Apollo Client直接使用
  │   │   └── mutations.ts
  │   └── person/
  │       ├── usePersonCreate.ts
  │       └── mutations.ts
  └── # _repositories, _usecases を削除
```

---

## 🎯 推奨アクション

### 短期的アクション
1. **設計方針を決定**
   - チームで議論し、どちらのパターンを採用するか決定
   - プロジェクトの規模・成長予測を考慮

2. **選択した方針をドキュメント化**
   - `ARCHITECTURE.md` を作成
   - 新機能追加時のガイドライン策定

### 長期的アクション（クリーンアーキテクチャ採用の場合）

#### フェーズ1: Person機能のリファクタリング
```typescript
// 1. person.repository.ts 作成
export interface IPersonRepository {
  create(input: CreatePersonInput): Promise<Person>;
  findById(id: string, include?: IncludeOptions): Promise<Person | null>;
}

// 2. create-person.usecase.ts 作成
export class CreatePersonUseCase {
  constructor(private personRepository: IPersonRepository) {}
  async execute(input: CreatePersonInput) { /* ... */ }
}

// 3. usePersonCreate.ts 簡素化
export function usePersonCreate() {
  const createPersonUseCase = useMemo(() => {
    const repository = new GraphQLPersonRepository(ENDPOINT);
    return new CreatePersonUseCase(repository);
  }, []);
  
  // ...
}
```

#### フェーズ2: 他機能の移行
- Organization機能
- Facility機能
- その他のドメイン機能

---

## 📝 結論

**現状の問題:**
- Auth機能とPerson機能で設計パターンが異なる
- Auth機能はクリーンアーキテクチャ、Person機能はシンプルHooksパターン
- バックエンドとフロントエンドの設計ギャップ

**原因:**
ご指摘の通り、「他のファイルではカスタムhookレベルしかない」ことが原因です。Person機能では Repository層とUseCase層が実装されていません。

**推奨:**
1. **プロジェクトの今後の規模を考慮して設計方針を統一**
2. **バックエンドがクリーンアーキテクチャを採用している場合、フロントエンドも統一することを推奨**
3. **段階的なリファクタリングで Person機能をクリーンアーキテクチャに移行**

これにより、保守性・テスト容易性・チーム開発の効率が大幅に向上します。
