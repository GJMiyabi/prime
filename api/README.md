# Prime API

組織・施設・人物管理システムのAPIサーバー

## 概要

このAPIは、以下の機能を提供するNestJS + GraphQL + Prismaベースのバックエンドシステムです：

- **認証・認可**: JWT認証による安全なAPIアクセス
- **組織管理**: 組織、施設、人物の階層的な管理
- **GraphQL API**: 柔軟なデータクエリとミューテーション
- **REST API**: 認証エンドポイント等の提供

## 技術スタック

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **API**: GraphQL (Apollo Server) + REST API
- **Authentication**: JWT + Passport
- **Testing**: Jest (E2E テスト)

## 必要環境

- Node.js 18.x 以上
- npm 9.x 以上
- PostgreSQL 14.x 以上

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env`ファイルを作成し、以下の設定を行います：

```env
# データベース設定
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=appdb
POSTGRES_PORT=5432
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/appdb"

# JWT認証設定
JWT_SECRET=your_super_secret_jwt_key_here_please_change_in_production
JWT_EXPIRES_IN=24h
```

### 3. データベースの設定

PostgreSQLが起動していることを確認し、データベースのマイグレーションを実行します：

```bash
# Prismaクライアントの生成
npm run generate

# データベースマイグレーション
npx prisma migrate dev --schema=src/frameworks/prisma/schema.prisma

# または、既存のDBに対してスキーマをプッシュ
npx prisma db push --schema=src/frameworks/prisma/schema.prisma
```

### 4. シードデータの作成

テスト用のデータとアカウントを作成します：

```bash
npm run seed
```

作成されるアカウント：

- **管理者**: `username: admin`, `password: admin123`
- **教師**: `username: teacher`, `password: teacher123`
- **学生**: `username: student`, `password: student123`

## 起動方法

### 開発サーバーの起動

```bash
# 開発モード（ファイル監視あり）
npm run dev

# または
npm run start:dev
```

サーバーは `http://localhost:4000` で起動します。

### 本番モード

```bash
# ビルド
npm run build

# 本番サーバー起動
npm run start:prod
```

## API エンドポイント

### GraphQL

- **エンドポイント**: `http://localhost:4000/graphql`
- **GraphQL Playground**: 開発モードで自動的に利用可能

### REST API

- **ログイン**: `POST /auth/login`

## 使用方法

### 1. ログイン（GraphQL）

```graphql
mutation {
  login(input: { username: "admin", password: "admin123" }) {
    accessToken
  }
}
```

### 2. ログイン（REST API）

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### 3. 認証が必要なAPIの利用

取得したアクセストークンをAuthorizationヘッダーに設定：

```bash
Authorization: Bearer <your_access_token>
```

### 4. 人物の作成

```graphql
mutation {
  saveAdminPerson(
    input: { name: "田中太郎", value: "tanaka@example.com", type: EMAIL }
  ) {
    id
    name
    value
    type
  }
}
```

### 5. 人物の検索

```graphql
query {
  person(id: "person_id_here") {
    id
    name
    contacts {
      id
      type
      value
    }
  }
}
```

## テスト

### E2Eテストの実行

```bash
npm run test:e2e
```

テストには以下が含まれます：

- 認証機能のテスト（ログイン、JWTトークン検証）
- Person CRUD操作のテスト
- GraphQL API統合テスト

### 単体テストの実行

```bash
npm run test
```

## データベース管理

### Prisma Studio

データベースの内容をGUIで確認・編集できます：

```bash
npm run studio
```

### マイグレーション

スキーマを変更した場合：

```bash
npx prisma migrate dev --schema=src/frameworks/prisma/schema.prisma
```

### データベースのリセット

```bash
npx prisma migrate reset --schema=src/frameworks/prisma/schema.prisma
```

## ファイル構成

```
src/
├── domains/           # ドメインモデル
│   ├── entities/      # エンティティ
│   ├── repositories/  # リポジトリインターフェース
│   ├── type/         # ドメイン型定義
│   └── value-object/ # 値オブジェクト
├── frameworks/        # フレームワーク層
│   ├── nest/         # NestJS設定
│   │   ├── auth/     # 認証機能
│   │   ├── person/   # 人物管理
│   │   └── shared/   # 共通機能
│   └── prisma/       # Prisma設定
├── interface-adapters/ # インターフェースアダプター
│   └── repositories/ # Prismaリポジトリ実装
├── shared/           # 共通ユーティリティ
└── usecases/         # ユースケース層
```

## トラブルシューティング

### ポート競合エラー

ポート4000が使用中の場合、他のポートを指定：

```bash
PORT=4001 npm run dev
```

### データベース接続エラー

1. PostgreSQLが起動しているか確認
2. `.env`ファイルの`DATABASE_URL`が正しいか確認
3. データベースが存在するか確認

### マイグレーションエラー

データベースをリセットして再実行：

```bash
npx prisma migrate reset --schema=src/frameworks/prisma/schema.prisma
npm run seed
```

## 開発

### 新しいエンティティの追加

1. `src/domains/entities/`にエンティティクラスを作成
2. `src/frameworks/prisma/schema.prisma`にPrismaモデルを追加
3. リポジトリインターフェースとPrisma実装を作成
4. ユースケースとリゾルバーを実装

### GraphQLスキーマの更新

1. `graphql-schema/`でスキーマファイルを更新
2. `npm run codegen`でTypeScript型を生成

## ライセンス

MIT License

  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
