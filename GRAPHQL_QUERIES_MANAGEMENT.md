# GraphQLクエリ管理のベストプラクティス

## 概要

GraphQLクエリ定義を一元管理するため、専用ディレクトリ `_repositories/graphql/` を作成しました。

## 問題点（Before）

以前は、GraphQLクエリ定義がRepositoryファイル内に直接記述されていました：

```typescript
// ❌ 悪い例: person.repository.ts
const CREATE_SINGLE_PERSON = gql`
  mutation CreateSinglePerson($input: SinglePersonAndContactInput!) {
    createSinglePerson(input: $input) { ... }
  }
`;

export class GraphQLPersonRepository implements IPersonRepository {
  async create(input: CreatePersonInput) {
    // クエリ定義と実装が混在
  }
}
```

**問題点：**
- 責務の混在：クエリ定義とビジネスロジックが同じファイル
- 再利用困難：他の場所で同じクエリを使いたくても共有できない
- 管理の分散：複数のRepositoryにクエリが散在
- テストの複雑化：モック作成時にクエリ定義も含める必要がある

## 解決策（After）

GraphQLクエリ定義を専用ファイルに分離し、mutations/queries で責務を明確化：

```
web/src/app/_repositories/
  ├── graphql/
  │   ├── mutations/                # 作成・更新・削除系
  │   │   ├── index.ts             # Mutations統合エクスポート
  │   │   ├── auth.mutations.ts    # 認証ミューテーション
  │   │   ├── person.mutations.ts  # Personミューテーション
  │   │   └── [domain].mutations.ts
  │   ├── queries/                 # 取得系
  │   │   ├── index.ts             # Queries統合エクスポート
  │   │   ├── auth.queries.ts      # 認証クエリ
  │   │   ├── person.queries.ts    # Personクエリ
  │   │   └── [domain].queries.ts
  │   └── index.ts                 # 全体統合エクスポート
  ├── auth.repository.ts
  └── person.repository.ts
```

### 1. クエリ定義ファイル

**Mutations（作成・更新・削除）:**
```typescript
// ✅ 良い例: _repositories/graphql/mutations/person.mutations.ts
import { gql } from "@apollo/client";

export const CREATE_SINGLE_PERSON = gql`
  mutation CreateSinglePerson($input: SinglePersonAndContactInput!) {
    createSinglePerson(input: $input) {
      id
      name
      value
    }
  }
`;

export const UPDATE_PERSON = gql`
  mutation UpdatePerson($id: ID!, $input: PersonUpdateInput!) {
    updatePerson(id: $id, input: $input) {
      id
      name
    }
  }
`;
```

**Queries（取得）:**
```typescript
// ✅ 良い例: _repositories/graphql/queries/person.queries.ts
import { gql } from "@apollo/client";

export const GET_PERSON = gql`
  query GetPerson($id: ID!, $include: PersonIncludeInput) {
    person(id: $id, include: $include) {
      id
      name
      # ... フィールド定義
    }
  }
`;

export const GET_PEOPLE = gql`
  query GetPeople($filter: PersonFilterInput) {
    people(filter: $filter) {
      items {
        id
        name
      }
    }
  }
`;
```

### 2. Repositoryファイル

```typescript
// ✅ 良い例: person.repository.ts
import { CREATE_SINGLE_PERSON } from "./graphql/mutations/person.mutations";
import { GET_PERSON } from "./graphql/queries/person.queries";

export class GraphQLPersonRepository implements IPersonRepository {
  async create(input: CreatePersonInput) {
    const { data } = await this.client.mutate({
      mutation: CREATE_SINGLE_PERSON,  // Mutationsからインポート
      variables: { input },
    });
    return data?.createSinglePerson || null;
  }

  async findById(id: string) {
    const { data } = await this.client.query({
      query: GET_PERSON,              // Queriesからインポート
      variables: { id },
    });
    return data?.person || null;
  }
}
```

## メリット

### 1. 責務の明確化
- **クエリ定義**: GraphQL通信仕様 → `graphql/*.queries.ts`
- **Repository実装**: データアクセスロジック → `*.repository.ts`

### 2. 再利用性の向上
```typescript
// 複数の場所で同じクエリを使用可能
import { GET_PERSON } from "@/app/_repositories/graphql/queries/person.queries";
import { CREATE_SINGLE_PERSON } from "@/app/_repositories/graphql/mutations/person.mutations";
```

### 3. **管理の一元化**
すべてのGraphQLクエリが `_repositories/graphql/` に集約：
- **Mutations**: `mutations/` ディレクトリ
- **Queries**: `queries/` ディレクトリ
- 検索が容易
- 重複チェックが簡単
- 変更の影響範囲が明確

### 4. テストの簡素化
```typescript
// クエリをモック化するのが容易
jest.mock("@/app/_repositories/graphql/person.queries", () => ({
  CREATE_SINGLE_PERSON: mockQuery,
}));
```

### 5. 型安全性の向上
```typescript
// クエリとRepositoryの型が明確に分離
type CreatePersonMutation = {
  createSinglePerson: SinglePerson;
};
```

## ファイル構成例

### Mutations（作成・更新・削除）

**auth.mutations.ts**
```typescript
export const LOGIN_MUTATION = gql`...`;
export const LOGOUT_MUTATION = gql`...`;
export const REFRESH_TOKEN_MUTATION = gql`...`;
```

**person.mutations.ts**
```typescript
export const CREATE_SINGLE_PERSON = gql`...`;
export const UPDATE_PERSON = gql`...`;
export const DELETE_PERSON = gql`...`;
```

**mutations/index.ts**
```typescript
export * from "./auth.mutations";
export * from "./person.mutations";
```

### Queries（取得）

**auth.queries.ts**
```typescript
export const GET_CURRENT_USER = gql`...`;
export const VERIFY_TOKEN = gql`...`;
```

**person.queries.ts**
```typescript
export const GET_PERSON = gql`...`;
export const GET_PEOPLE = gql`...`;
```

**queries/index.ts**
```typescript
export * from "./auth.queries";
export * from "./person.queries";
```

### 統合エクスポート

**graphql/index.ts**
```typescript
export * from "./mutations";
export * from "./queries";
```

## 使用方法

### 方法1: 直接インポート（推奨）
```typescript
// Mutationsから
import { CREATE_SINGLE_PERSON } from "@/app/_repositories/graphql/mutations/person.mutations";

// Queriesから
import { GET_PERSON } from "@/app/_repositories/graphql/queries/person.queries";
```

### 方法2: ディレクトリからまとめてインポート
```typescript
import { CREATE_SINGLE_PERSON } from "@/app/_repositories/graphql/mutations";
import { GET_PERSON } from "@/app/_repositories/graphql/queries";
```

### 方法3: 統合エクスポートから（名前空間が混在するため非推奨）
```typescript
import { CREATE_SINGLE_PERSON, GET_PERSON } from "@/app/_repositories/graphql";
```

## 命名規則

### ファイル名
- **Mutations**: `[domain].mutations.ts`
  - 例: `person.mutations.ts`, `auth.mutations.ts`, `organization.mutations.ts`
- **Queries**: `[domain].queries.ts`
  - 例: `person.queries.ts`, `auth.queries.ts`, `organization.queries.ts`

### クエリ定数名
- **Mutation**: `[ACTION]_[ENTITY]` （大文字スネークケース）
  - 作成: `CREATE_SINGLE_PERSON`, `CREATE_ORGANIZATION`
  - 更新: `UPDATE_PERSON`, `UPDATE_ORGANIZATION`
  - 削除: `DELETE_PERSON`, `DELETE_ORGANIZATION`
- **Query**: `GET_[ENTITY]` または `GET_[ENTITIES]`（大文字スネークケース）
  - 単体: `GET_PERSON`, `GET_ORGANIZATION`
  - 一覧: `GET_PEOPLE`, `GET_ORGANIZATIONS`
  - 検証: `VERIFY_TOKEN`, `CHECK_PERMISSION`

## 新しいドメインの追加手順

### 1. Mutationsファイルを作成
```bash
touch _repositories/graphql/mutations/organization.mutations.ts
```

```typescript
// _repositories/graphql/mutations/organization.mutations.ts
import { gql } from "@apollo/client";

export const CREATE_ORGANIZATION = gql`
  mutation CreateOrganization($input: OrganizationInput!) {
    createOrganization(input: $input) {
      id
      name
    }
  }
`;

export const UPDATE_ORGANIZATION = gql`
  mutation UpdateOrganization($id: ID!, $input: OrganizationInput!) {
    updateOrganization(id: $id, input: $input) {
      id
      name
    }
  }
`;
```

### 2. Queriesファイルを作成
```bash
touch _repositories/graphql/queries/organization.queries.ts
```

```typescript
// _repositories/graphql/queries/organization.queries.ts
import { gql } from "@apollo/client";

export const GET_ORGANIZATION = gql`
  query GetOrganization($id: ID!) {
    organization(id: $id) {
      id
      name
    }
  }
`;

export const GET_ORGANIZATIONS = gql`
  query GetOrganizations($filter: OrganizationFilterInput) {
    organizations(filter: $filter) {
      items {
        id
        name
      }
    }
  }
`;
```

### 3. 各index.tsにエクスポートを追加
```typescript
// _repositories/graphql/mutations/index.ts
export * from "./organization.mutations";

// _repositories/graphql/queries/index.ts
export * from "./organization.queries";
```

### 4. Repositoryで使用
```typescript
// _repositories/organization.repository.ts
import { CREATE_ORGANIZATION } from "./graphql/mutations/organization.mutations";
import { GET_ORGANIZATION } from "./graphql/queries/organization.queries";
```

## 移行済みファイル

以下のファイルは非推奨となり、新しい構造に移行されました：

### 非推奨（旧構造）
```
web/src/app/_repositories/graphql/
  ├── auth.queries.ts              ❌ 非推奨（混在）
  └── person.queries.ts            ❌ 非推奨（混在）

web/src/app/_hooks/person/
  ├── form/
  │   ├── mutations/mutations.ts   ❌ 非推奨
  │   └── queries/quires.ts        ❌ 非推奨
```

### 新しい場所（推奨）
```
web/src/app/_repositories/graphql/
  ├── mutations/
  │   ├── auth.mutations.ts        ✅ 使用推奨
  │   └── person.mutations.ts      ✅ 使用推奨
  └── queries/
      ├── auth.queries.ts          ✅ 使用推奨
      └── person.queries.ts        ✅ 使用推奨
```

## 注意点

1. **Mutations と Queries を明確に分離**
   - 作成・更新・削除 → `mutations/` ディレクトリ
   - 取得・検証 → `queries/` ディレクトリ
   - TypeScript型定義は `_types/` に配置
   - ビジネスロジックは `_usecases/` に配置

2. **GraphQL操作タイプとファイル配置の対応**
   ```typescript
   // ❌ 間違い: QueriesディレクトリにMutationを配置
   // queries/person.queries.ts
   export const CREATE_PERSON = gql`
     mutation CreatePerson { ... }  // Mutationなのにqueriesに配置
   `;
   
   // ✅ 正しい: MutationsディレクトリにMutationを配置
   // mutations/person.mutations.ts
   export const CREATE_PERSON = gql`
     mutation CreatePerson { ... }
   `;
   ```

3. **フラグメントの使用**を検討
   ```typescript
   // queries/person.queries.ts
   export const PERSON_FRAGMENT = gql`
     fragment PersonFields on Person {
       id
       name
     }
   `;
   
   export const GET_PERSON = gql`
     ${PERSON_FRAGMENT}
     query GetPerson($id: ID!) {
       person(id: $id) {
         ...PersonFields
       }
     }
   `;
   ```

4. **将来の拡張を考慮**
   - コメントで将来追加予定のクエリを記載
   - 一貫した命名規則を維持
   - サブスクリプションは別ディレクトリ `subscriptions/` を検討

## まとめ

GraphQLクエリ定義を `_repositories/graphql/` に一元管理し、mutations/queries で責務を分離することで：

✅ **責務が明確になる**: Mutations（作成・更新・削除）とQueries（取得）を分離  
✅ **再利用性が向上する**: 同じクエリを複数箇所で使用可能  
✅ **管理が容易になる**: ディレクトリ構造で操作タイプが明確  
✅ **テストが簡単になる**: GraphQL操作タイプごとにモック可能  
✅ **コードの可読性が向上する**: ファイルパスから操作内容が推測可能  
✅ **GraphQLの慣習に従う**: 業界標準のパターン

新しい機能追加時はこのパターンに従ってください。

### GraphQL操作タイプのディレクトリマッピング

| GraphQL操作 | ディレクトリ | ファイル名 | 例 |
|------------|------------|----------|-----|
| mutation | `mutations/` | `[domain].mutations.ts` | `CREATE_PERSON` |
| query | `queries/` | `[domain].queries.ts` | `GET_PERSON` |
| subscription | `subscriptions/` | `[domain].subscriptions.ts` | `PERSON_UPDATED` |
