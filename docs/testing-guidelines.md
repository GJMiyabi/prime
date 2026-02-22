# テストガイドライン

## 📝 基本原則

### 1. テストの3A構造
すべてのテストは **Arrange-Act-Assert** パターンに従う：

```typescript
it('should create a person with valid data', async () => {
  // Arrange (準備)
  const input = {
    name: 'John Doe',
    email: 'john@example.com',
  };

  // Act (実行)
  const result = await personService.create(input);

  // Assert (検証)
  expect(result.id).toBeDefined();
  expect(result.name).toBe('John Doe');
  expect(result.email).toBe('john@example.com');
});
```

---

## 🏗️ ディレクトリ構造

### Frontend (web/)
```
src/
├── app/
│   ├── _hooks/
│   │   ├── useLogin.ts
│   │   └── useLogin.spec.ts          # フックのテスト
│   ├── _usecases/
│   │   └── auth/
│   │       ├── login.interactor.ts
│   │       └── login.interactor.spec.ts
│   └── _components/
│       └── common/
│           ├── Button.tsx
│           └── Button.spec.tsx        # コンポーネントのテスト
└── test/
    ├── setup.ts                       # Vitest セットアップ
    ├── mocks/
    │   ├── handlers.ts                # MSW ハンドラー
    │   └── server.ts                  # MSW サーバー
    └── factories/
        ├── person.factory.ts          # テストデータファクトリー
        └── auth.factory.ts
```

### Backend (api/)
```
src/
├── usecases/
│   └── person/
│       ├── interactor.ts
│       └── interactor.spec.ts         # ユースケースのテスト
├── frameworks/
│   └── nest/
│       ├── person/
│       │   ├── person.resolver.ts
│       │   └── person.resolver.spec.ts
│       └── auth/
│           ├── guards/
│           │   ├── gql-auth.guard.ts
│           │   └── gql-auth.guard.spec.ts
└── test/
    └── app.e2e-spec.ts                # E2Eテスト
```

---

## 🎯 命名規則

### ファイル名
- Unit Test: `*.spec.ts` または `*.test.ts`
- E2E Test: `*.e2e-spec.ts`
- Test Setup: `setup.ts`
- Mocks: `*.mock.ts`

### describe ブロック
```typescript
// ✅ Good: クラス名・関数名を正確に
describe('PersonService', () => {
  describe('create', () => {
    it('should create a person with valid data', () => {});
  });
});

// ❌ Bad: 曖昧な表現
describe('Person tests', () => {
  it('test create', () => {});
});
```

### it ブロック
```typescript
// ✅ Good: should + 動詞 + 期待結果
it('should return JWT token when credentials are valid', () => {});
it('should throw UnauthorizedException when password is invalid', () => {});
it('should sanitize HTML input to prevent XSS', () => {});

// ❌ Bad: 曖昧・不完全
it('works', () => {});
it('returns token', () => {});
it('login', () => {});
```

---

## 🧪 テストパターン

### 1. Unit Test - Service/UseCase

#### Backend: NestJS Service
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { PersonInteractor } from './interactor';
import { PersonRepository } from '../../domains/repositories/person.repositories';

describe('PersonInteractor', () => {
  let interactor: PersonInteractor;
  let repository: jest.Mocked<PersonRepository>;

  beforeEach(async () => {
    // モックリポジトリ
    const mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonInteractor,
        { provide: PersonRepository, useValue: mockRepository },
      ],
    }).compile();

    interactor = module.get<PersonInteractor>(PersonInteractor);
    repository = module.get(PersonRepository);
  });

  describe('create', () => {
    it('should create a person with valid input', async () => {
      // Arrange
      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        principalKind: PrincipalKind.STUDENT,
      };
      const expected = { id: 'cuid123', ...input };
      repository.create.mockResolvedValue(expected);

      // Act
      const result = await interactor.create(input);

      // Assert
      expect(result).toEqual(expected);
      expect(repository.create).toHaveBeenCalledWith(input);
      expect(repository.create).toHaveBeenCalledTimes(1);
    });

    it('should throw error when email is duplicated', async () => {
      // Arrange
      const input = { name: 'John', email: 'existing@example.com' };
      repository.create.mockRejectedValue(
        new Error('Email already exists')
      );

      // Act & Assert
      await expect(interactor.create(input)).rejects.toThrow(
        'Email already exists'
      );
    });
  });
});
```

#### Frontend: React Hook
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useLogin } from './useLogin';
import { loginInteractor } from '@/app/_usecases/auth/login.interactor';
import { vi } from 'vitest';

vi.mock('@/app/_usecases/auth/login.interactor');

describe('useLogin', () => {
  const mockLoginInteractor = vi.mocked(loginInteractor);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should login successfully with valid credentials', async () => {
    // Arrange
    mockLoginInteractor.execute.mockResolvedValue({
      token: 'jwt-token-123',
      user: { id: '1', name: 'John' },
    });

    // Act
    const { result } = renderHook(() => useLogin());
    result.current.login('john@example.com', 'password123');

    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  it('should set error when credentials are invalid', async () => {
    // Arrange
    mockLoginInteractor.execute.mockRejectedValue(
      new Error('Invalid credentials')
    );

    // Act
    const { result } = renderHook(() => useLogin());
    result.current.login('john@example.com', 'wrong-password');

    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Invalid credentials');
    });
  });
});
```

---

### 2. Unit Test - React Component

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';
import { vi } from 'vitest';

describe('Button', () => {
  it('should render with correct text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click Me');
  });

  it('should call onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);

    fireEvent.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click Me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should apply custom className', () => {
    render(<Button className="custom-class">Click Me</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });
});
```

---

### 3. Integration Test - GraphQL Resolver

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/frameworks/nest/app.module';

describe('PersonResolver (Integration)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // ログインしてトークン取得
    const loginResponse = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation {
            login(email: "admin@example.com", password: "password") {
              token
            }
          }
        `,
      });

    authToken = loginResponse.body.data.login.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a person', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          mutation {
            createPerson(input: {
              name: "John Doe"
              email: "john@example.com"
              principalKind: STUDENT
            }) {
              id
              name
              email
            }
          }
        `,
      });

    expect(response.status).toBe(200);
    expect(response.body.data.createPerson).toMatchObject({
      name: 'John Doe',
      email: 'john@example.com',
    });
  });
});
```

---

### 4. Integration Test - Frontend with MSW

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';
import { PersonList } from './PersonList';

describe('PersonList (Integration)', () => {
  it('should display list of persons', async () => {
    // Arrange: MSW でモックレスポンス設定
    server.use(
      http.post('/graphql', () => {
        return HttpResponse.json({
          data: {
            persons: [
              { id: '1', name: 'John Doe' },
              { id: '2', name: 'Jane Smith' },
            ],
          },
        });
      })
    );

    // Act
    render(<PersonList />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('should display error when API fails', async () => {
    // Arrange: エラーレスポンス
    server.use(
      http.post('/graphql', () => {
        return HttpResponse.json(
          { errors: [{ message: 'Network error' }] },
          { status: 500 }
        );
      })
    );

    // Act
    render(<PersonList />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

---

## 🎭 モック戦略

### 1. 外部依存は必ずモック

#### HTTP Client (axios)
```typescript
vi.mock('axios');
const mockAxios = vi.mocked(axios);

mockAxios.post.mockResolvedValue({
  data: { token: 'jwt-token' },
});
```

#### Prisma Client
```typescript
const mockPrisma = {
  person: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

beforeEach(() => {
  vi.clearAllMocks();
});
```

#### Next.js Router
```typescript
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/test-path',
}));
```

---

### 2. Test Factories (テストデータ生成)

```typescript
// test/factories/person.factory.ts
export const createMockPerson = (overrides = {}) => ({
  id: 'person-123',
  name: 'John Doe',
  email: 'john@example.com',
  principalKind: PrincipalKind.STUDENT,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// 使用例
const person = createMockPerson({ name: 'Custom Name' });
```

---

## 📊 カバレッジ要件

### PRマージ条件
- **Lines**: ≥ 60%
- **Branches**: ≥ 60%
- **Functions**: ≥ 60%
- **Statements**: ≥ 60%

### 新規コード
- 新規ファイルは **最低80%** カバレッジ必須
- Critical path (認証・決済など) は **100%** 必須

---

## ✅ チェックリスト

### PR作成前
- [ ] すべてのテストが通る (`npm test`)
- [ ] カバレッジが閾値を満たす (`npm run test:coverage`)
- [ ] 新規コードにテストが含まれる
- [ ] テストが AAA パターンに従っている
- [ ] モックが適切に設定されている
- [ ] Edge cases をカバーしている

### コードレビュー時
- [ ] テストの可読性が高い
- [ ] テストが単一責任を持つ
- [ ] テストが独立している（他のテストに依存しない）
- [ ] テストが deterministic（常に同じ結果）
- [ ] テストが高速（1テスト < 100ms）

---

## 🚫 アンチパターン

### ❌ 避けるべきこと

1. **テストの相互依存**
```typescript
// ❌ Bad
let sharedUser;
it('creates user', () => {
  sharedUser = createUser();
});
it('updates user', () => {
  updateUser(sharedUser); // 前のテストに依存
});
```

2. **曖昧な期待値**
```typescript
// ❌ Bad
expect(result).toBeTruthy();

// ✅ Good
expect(result.id).toBe('person-123');
expect(result.name).toBe('John Doe');
```

3. **過度なモック**
```typescript
// ❌ Bad: Pure function をモック
vi.mock('./utils', () => ({
  add: vi.fn(() => 5), // 2 + 3 のような単純な計算をモック
}));

// ✅ Good: 外部依存のみモック
vi.mock('axios'); // HTTP call
```

4. **実装詳細のテスト**
```typescript
// ❌ Bad: 内部状態をテスト
expect(component.state.isLoading).toBe(false);

// ✅ Good: ユーザー視点でテスト
expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
```

---

## 📚 参考資料

- [Testing Best Practices - Kent C. Dodds](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
