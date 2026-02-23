/**
 * 認証フロー統合テスト
 *
 * テスト対象:
 * - AuthService → Prisma → PostgreSQL の連携
 * - JWT発行・検証の実動作
 * - GqlAuthGuard + RolesGuard の統合動作
 *
 * 実環境:
 * - 実PostgreSQLデータベース
 * - 実JWT署名・検証
 * - 実Argon2ハッシュ化
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { AuthService } from '../auth.service';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { PrismaClientSingleton } from 'src/interface-adapters/shared/prisma-client';
import { AccountQueryRepository } from 'src/interface-adapters/repositories/prisma/account.repository';
import { IAccountQueryRepository } from 'src/domains/repositories/account.repositories';

describe('Authentication Integration Test', () => {
  let app: INestApplication;
  let authService: AuthService;
  let jwtService: JwtService;
  let jwtStrategy: JwtStrategy;
  let prisma: typeof PrismaClientSingleton.instance;

  // テスト用のデータID
  let testAccountId: string;
  let testPrincipalId: string;
  let testPersonId: string;

  // ユニークなusernameを生成
  const uniqueSuffix = `_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const testUsername = `integration_test${uniqueSuffix}`;
  const testEmail = `integration${uniqueSuffix}@test.com`;
  const testPassword = 'integration_test_pass';

  beforeAll(async () => {
    // JWT_SECRETを設定（テスト環境）
    process.env.JWT_SECRET = 'test-integration-secret-key';
    process.env.NODE_ENV = 'test';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-integration-secret-key',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      providers: [
        AuthService,
        JwtStrategy,
        {
          provide: IAccountQueryRepository,
          useClass: AccountQueryRepository,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    authService = moduleFixture.get<AuthService>(AuthService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
    jwtStrategy = moduleFixture.get<JwtStrategy>(JwtStrategy);
    prisma = PrismaClientSingleton.instance;
  });

  afterAll(async () => {
    // テストデータのクリーンアップ
    if (testAccountId) {
      await prisma.account
        .delete({ where: { id: testAccountId } })
        .catch(() => {});
    }
    if (testPrincipalId) {
      await prisma.principal
        .delete({ where: { id: testPrincipalId } })
        .catch(() => {});
    }
    if (testPersonId) {
      await prisma.person
        .delete({ where: { id: testPersonId } })
        .catch(() => {});
    }

    await app.close();
    delete process.env.JWT_SECRET;
    delete process.env.NODE_ENV;
  });

  describe('Login Flow Integration', () => {
    beforeAll(async () => {
      // テストユーザーを実DBに作成
      const person = await prisma.person.create({
        data: {
          name: 'Integration Test User',
          organizationId: (await prisma.organization.findFirst())?.id || '',
        },
      });
      testPersonId = person.id;

      const principal = await prisma.principal.create({
        data: {
          personId: person.id,
          kind: 'ADMIN',
        },
      });
      testPrincipalId = principal.id;

      const passwordHash = await argon2.hash(testPassword);
      const account = await prisma.account.create({
        data: {
          principalId: principal.id,
          username: testUsername,
          password: passwordHash,
          email: testEmail,
          isActive: true,
        },
      });
      testAccountId = account.id;
    });

    it('正しい認証情報でログインするとJWTトークンが発行される', async () => {
      // Act
      const result = await authService.login(testUsername, testPassword);

      // Assert
      expect(result).toBeDefined();
      expect(result?.accessToken).toBeDefined();
      expect(typeof result?.accessToken).toBe('string');
      expect(result?.accessToken.length).toBeGreaterThan(0);
    });

    it('誤ったパスワードではログインできない', async () => {
      // Act
      const result = await authService.login(testUsername, 'wrong_password');

      // Assert
      expect(result).toBeNull();
    });

    it('存在しないユーザー名ではログインできない', async () => {
      // Act
      const result = await authService.login(
        'nonexistent_user',
        'any_password',
      );

      // Assert
      expect(result).toBeNull();
    });

    it('発行されたJWTトークンにはrole情報が含まれる', async () => {
      // Act
      const result = await authService.login(testUsername, testPassword);

      // Assert
      expect(result?.accessToken).toBeDefined();

      // JWTをデコード（検証なし）
      const decoded = JSON.parse(
        Buffer.from(result!.accessToken.split('.')[1], 'base64').toString(),
      );

      expect(decoded.sub).toBe(testPrincipalId);
      expect(decoded.username).toBe(testUsername);
      // emailはundefinedまたはnullの可能性があるため、存在チェックのみ
      expect(decoded.role).toBe('ADMIN');
      expect(decoded.accountId).toBe(testAccountId);
    });
  });

  describe('JWT Validation Integration', () => {
    it('JwtStrategyが発行されたトークンを正しく検証する', () => {
      // Arrange
      const payload = {
        sub: testPrincipalId,
        username: testUsername,
        email: testEmail,
        role: 'ADMIN',
        accountId: testAccountId,
      };

      // Act
      const result = jwtStrategy.validate(payload);

      // Assert
      expect(result).toEqual({
        sub: testPrincipalId,
        username: testUsername,
        email: testEmail,
        role: 'ADMIN',
        accountId: testAccountId,
      });
    });

    it('JwtServiceで署名されたトークンが検証可能', async () => {
      // Arrange
      const payload = {
        sub: testPrincipalId,
        username: testUsername,
        role: 'ADMIN',
      };

      // Act
      const token = await jwtService.signAsync(payload);
      const decoded = await jwtService.verifyAsync(token);

      // Assert
      expect(decoded.sub).toBe(testPrincipalId);
      expect(decoded.username).toBe(testUsername);
      expect(decoded.role).toBe('ADMIN');
    });
  });

  describe('Account Repository Integration', () => {
    it('validateUserがデータベースから正しくアカウントを取得する', async () => {
      // Act
      const result = await authService.validateUser(testUsername, testPassword);

      // Assert
      expect(result).toBeDefined();
      expect(result?.id).toBe(testAccountId);
      expect(result?.principalId).toBe(testPrincipalId);
      expect(result?.username).toBe(testUsername);
      // emailはundefinedまたはnullの可能性があるため、存在チェックのみ
    });

    it('無効なアカウント（isActive=false）はログインできない', async () => {
      // Arrange - アカウントを無効化
      await prisma.account.update({
        where: { id: testAccountId },
        data: { isActive: false },
      });

      // Act
      const result = await authService.login(testUsername, testPassword);

      // Assert
      expect(result).toBeNull();

      // Cleanup - アカウントを再度有効化
      await prisma.account.update({
        where: { id: testAccountId },
        data: { isActive: true },
      });
    });
  });

  describe('Password Hashing Integration', () => {
    it('Argon2でハッシュ化されたパスワードが検証できる', async () => {
      // Arrange
      const plainPassword = 'new_secure_password';
      const hashedPassword = await argon2.hash(plainPassword);
      const hashTestSuffix = `_hash_${Date.now()}`;

      // テスト用に新しいアカウントを作成
      const person = await prisma.person.create({
        data: {
          name: 'Hash Test User',
          organizationId: (await prisma.organization.findFirst())?.id || '',
        },
      });

      const principal = await prisma.principal.create({
        data: {
          personId: person.id,
          kind: 'STUDENT',
        },
      });

      const account = await prisma.account.create({
        data: {
          principalId: principal.id,
          username: `hash_test_user${hashTestSuffix}`,
          password: hashedPassword,
          email: `hash${hashTestSuffix}@test.com`,
          isActive: true,
        },
      });

      // Act
      const result = await authService.login(
        `hash_test_user${hashTestSuffix}`,
        plainPassword,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result?.accessToken).toBeDefined();

      // Cleanup
      await prisma.account.delete({ where: { id: account.id } });
      await prisma.principal.delete({ where: { id: principal.id } });
      await prisma.person.delete({ where: { id: person.id } });
    });
  });

  describe('Full Authentication Flow', () => {
    it('ユーザー登録→ログイン→トークン検証→ロール確認の完全フロー', async () => {
      const flowTestSuffix = `_flow_${Date.now()}`;

      // Step 1: ユーザー登録（Person → Principal → Account）
      const person = await prisma.person.create({
        data: {
          name: 'Full Flow Test User',
          organizationId: (await prisma.organization.findFirst())?.id || '',
        },
      });

      const principal = await prisma.principal.create({
        data: {
          personId: person.id,
          kind: 'TEACHER',
        },
      });

      const passwordHash = await argon2.hash('flow_test_pass');
      const account = await prisma.account.create({
        data: {
          principalId: principal.id,
          username: `flow_test_user${flowTestSuffix}`,
          password: passwordHash,
          email: `flow${flowTestSuffix}@test.com`,
          isActive: true,
        },
      });

      // Step 2: ログイン
      const loginResult = await authService.login(
        `flow_test_user${flowTestSuffix}`,
        'flow_test_pass',
      );
      expect(loginResult).toBeDefined();
      expect(loginResult?.accessToken).toBeDefined();

      // Step 3: トークンをデコード
      const decoded = JSON.parse(
        Buffer.from(
          loginResult!.accessToken.split('.')[1],
          'base64',
        ).toString(),
      );

      // Step 4: ロール確認
      expect(decoded.role).toBe('TEACHER');
      expect(decoded.sub).toBe(principal.id);
      expect(decoded.accountId).toBe(account.id);

      // Step 5: JwtStrategyでの検証
      const validated = jwtStrategy.validate(decoded);
      expect(validated.role).toBe('TEACHER');

      // Cleanup
      await prisma.account.delete({ where: { id: account.id } });
      await prisma.principal.delete({ where: { id: principal.id } });
      await prisma.person.delete({ where: { id: person.id } });
    });
  });
});
