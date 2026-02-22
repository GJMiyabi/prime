# クリーンアーキテクチャ移行完了ドキュメント

## 概要

Person機能をクリーンアーキテクチャに統一しました。これでAuth機能とPerson機能が同じアーキテクチャパターンに従うようになりました。

## 新しいファイル構造

### Repository層（データアクセス）
```
web/src/app/_repositories/
  ├── graphql/                      # GraphQLクエリ定義
  │   ├── mutations/               # 作成・更新・削除系
  │   │   ├── index.ts
  │   │   ├── auth.mutations.ts
  │   │   └── person.mutations.ts
  │   ├── queries/                 # 取得系
  │   │   ├── index.ts
  │   │   ├── auth.queries.ts
  │   │   └── person.queries.ts
  │   └── index.ts                 # 統合エクスポート
  ├── auth.repository.ts           # 認証API通信
  └── person.repository.ts         # Person API通信（新規作成）
```

### UseCase層（ビジネスロジック）
```
web/src/app/_usecases/
  ├── auth/
  │   ├── login.usecase.ts
  │   ├── logout.usecase.ts
  │   ├── redirect.usecase.ts
  │   └── jwt.utils.ts
  └── person/                       # 新規作成
      ├── create-person.usecase.ts
      ├── get-person.usecase.ts
      └── index.ts
```

### Hooks層（UIとの橋渡し）
```
web/src/app/_hooks/
  ├── useLogin.ts
  ├── useLogout.ts
  └── person/
      ├── usePersonCreate.ts        # 新規作成
      ├── usePersonGet.ts           # 新規作成
      └── form/
          ├── usePersonCreateForm.ts # リファクタリング済み
          ├── index.ts              # 既存（非推奨）
          ├── mutations/            # 既存（非推奨）
          └── queries/              # 既存（非推奨）
```

### UI層（プレゼンテーション）
```
web/src/app/person/
  ├── [personId]/
  │   └── page.tsx                  # 更新済み（usePersonGet使用）
  ├── create/
  │   └── page.tsx
  └── _components/
      └── person/form/create/
          └── index.tsx             # 更新済み（usePersonCreateForm使用）
```

## アーキテクチャ層の責務

### 1. Repository層
**責務**: 外部APIとの通信を抽象化
- GraphQL/REST APIの実装詳細を隠蔽
- インターフェースを定義して依存性を逆転
- データの取得・保存のみを担当

**例**:
```typescript
export interface IPersonRepository {
  create(input: CreatePersonInput): Promise<SinglePerson | null>;
  findById(id: string, include?: PersonIncludeOptions): Promise<Person | null>;
}

export class GraphQLPersonRepository implements IPersonRepository {
  // GraphQL実装
}
```

### 2. UseCase層
**責務**: ビジネスロジックの実装
- バリデーション
- ビジネスルールの適用
- Repositoryを使用してデータ操作
- エラーハンドリング

**例**:
```typescript
export class CreatePersonUseCase {
  constructor(private personRepository: IPersonRepository) {}
  
  async execute(input: CreatePersonInput): Promise<CreatePersonResult> {
    // バリデーション
    if (!input.name) return { success: false, error: "名前は必須です" };
    
    // Repository経由でデータ操作
    const person = await this.personRepository.create(input);
    
    return { success: true, person };
  }
}
```

### 3. Hooks層
**責務**: React/Next.jsとUseCaseの橋渡し
- UseCaseのインスタンス化
- React stateの管理
- Next.js router連携
- UI向けのインターフェース提供

**例**:
```typescript
export function usePersonCreate() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const createPersonUseCase = useMemo(() => {
    const repository = new GraphQLPersonRepository(ENDPOINT);
    return new CreatePersonUseCase(repository);
  }, []);
  
  const executeCreate = async (input) => {
    setIsLoading(true);
    const result = await createPersonUseCase.execute(input);
    if (result.success) router.push(`/person/${result.person.id}`);
    setIsLoading(false);
  };
  
  return { executeCreate, isLoading };
}
```

### 4. UI層
**責務**: ユーザーインターフェースの表示
- Hooksを使用してデータ取得・操作
- ユーザー入力の受付
- レンダリング
- スタイリング

**例**:
```typescript
export default function PersonDetailPage() {
  const { data, isLoading, error } = usePersonGet(personId, { contacts: true });
  
  if (isLoading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;
  
  return <div>{data?.name}</div>;
}
```

## メリット

### 1. テスト容易性の向上
```typescript
// モックRepositoryを注入してUseCaseをテスト
const mockRepository: IPersonRepository = {
  create: jest.fn().mockResolvedValue(mockPerson),
  findById: jest.fn(),
};
const useCase = new CreatePersonUseCase(mockRepository);
```

### 2. 保守性の向上
- 各層の責務が明確
- 変更の影響範囲が限定的
- コードの可読性が向上

### 3. 拡張性の向上
- GraphQL → REST APIへの切り替えが容易（Repository層のみ変更）
- ビジネスロジックの再利用が可能
- 新機能追加時のパターンが統一

### 4. チーム開発の効率化
- Auth機能とPerson機能で同じパターン
- 新メンバーのオンボーディングが容易
- コードレビューの基準が明確

## 非推奨ファイル

以下のファイルは古いパターンで実装されており、新しいアーキテクチャに置き換えられました：

```
web/src/app/_hooks/person/
  ├── form/
  │   ├── index.ts                  # useCreateSinglePerson（Apollo直接使用）
  │   ├── mutations/mutations.ts    # GraphQL mutation定義（Repository層に移動）
  │   └── queries/quires.ts         # GraphQL query定義（Repository層に移動）
  └── get/
      └── index.ts                  # useGetPerson（Apollo直接使用）
```

**注意**: これらのファイルは互換性のため残していますが、新しいコードでは使用しないでください。

## 今後の対応

### 短期（推奨）
1. ✅ Person機能をクリーンアーキテクチャに移行（完了）
2. 🔲 Organization機能を同様に移行
3. 🔲 Facility機能を同様に移行
4. 🔲 古いファイルの削除（破壊的変更のため慎重に）

### 中期
1. 共通エラーハンドリングの実装
2. ローディング状態の統一管理
3. キャッシュ戦略の最適化

### 長期
1. Domain層の導入（エンティティ・値オブジェクト）
2. GraphQLクライアントの抽象化
3. E2Eテストの充実

## 新機能の追加方法

新しいドメイン（例: Facility）を追加する場合：

### 1. Repository作成
```typescript
// _repositories/facility.repository.ts
export interface IFacilityRepository {
  findAll(): Promise<Facility[]>;
}

export class GraphQLFacilityRepository implements IFacilityRepository {
  // 実装
}
```

### 2. UseCase作成
```typescript
// _usecases/facility/get-facilities.usecase.ts
export class GetFacilitiesUseCase {
  constructor(private facilityRepository: IFacilityRepository) {}
  // 実装
}
```

### 3. Hooks作成
```typescript
// _hooks/facility/useFacilityList.ts
export function useFacilityList() {
  const useCase = useMemo(() => {
    const repository = new GraphQLFacilityRepository(ENDPOINT);
    return new GetFacilitiesUseCase(repository);
  }, []);
  // 実装
}
```

### 4. UI作成
```typescript
// facility/page.tsx
export default function FacilityListPage() {
  const { data } = useFacilityList();
  // レンダリング
}
```

## 参考資料

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- バックエンドAPIのアーキテクチャ: `api/src/` ディレクトリを参照
- Auth機能の実装例: `web/src/app/_usecases/auth/`, `web/src/app/_hooks/useLogin.ts`

## 質問・問題

アーキテクチャに関する質問や問題がある場合は、チームのアーキテクトに相談してください。
