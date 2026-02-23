import {
  PrincipalCommandRepository,
  PrincipalQueryRepository,
} from '../principal.repository';
import { Principal } from 'src/domains/entities/principal';
import { PrincipalKind } from 'src/domains/type/principal-kind';
import { PrincipalKind as PrismaKind } from '@prisma/client';
import { Id } from 'src/domains/value-object/id';
import { PrismaClientSingleton } from 'src/interface-adapters/shared/prisma-client';

jest.mock('src/interface-adapters/shared/prisma-client');

describe('PrincipalCommandRepository', () => {
  let repository: PrincipalCommandRepository;
  let mockPrismaClient: any;

  beforeAll(() => {
    mockPrismaClient = {
      principal: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    (PrismaClientSingleton as any).instance = mockPrismaClient;
    repository = new PrincipalCommandRepository(mockPrismaClient);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    describe('正常系', () => {
      it('新しいPrincipal（ADMIN）を作成できる', async () => {
        // Arrange
        const principal = new Principal({
          id: new Id('123e4567-e89b-12d3-a456-426614174004'),
          kind: PrincipalKind.ADMIN,
          personId: new Id('123e4567-e89b-12d3-a456-426614174001'),
        });
        mockPrismaClient.principal.create.mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174004',
          kind: PrismaKind.ADMIN,
          personId: '123e4567-e89b-12d3-a456-426614174001',
        });

        // Act
        const result = await repository.create(principal);

        // Assert
        expect(mockPrismaClient.principal.create).toHaveBeenCalledWith({
          data: {
            id: '123e4567-e89b-12d3-a456-426614174004',
            kind: PrincipalKind.ADMIN,
            personId: '123e4567-e89b-12d3-a456-426614174001',
          },
        });
        expect(result.getId()).toBe('123e4567-e89b-12d3-a456-426614174004');
        expect(result.getKind()).toBe(PrincipalKind.ADMIN);
        expect(result.getPersonId()).toBe('123e4567-e89b-12d3-a456-426614174001');
      });

      it('新しいPrincipal（TEACHER）を作成できる', async () => {
        // Arrange
        const principal = new Principal({
          id: new Id('123e4567-e89b-12d3-a456-426614174004'),
          kind: PrincipalKind.TEACHER,
          personId: new Id('123e4567-e89b-12d3-a456-426614174001'),
        });
        mockPrismaClient.principal.create.mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174004',
          kind: PrismaKind.TEACHER,
          personId: '123e4567-e89b-12d3-a456-426614174001',
        });

        // Act
        const result = await repository.create(principal);

        // Assert
        expect(result.getKind()).toBe(PrincipalKind.TEACHER);
      });

      it('新しいPrincipal（STUDENT）を作成できる', async () => {
        // Arrange
        const principal = new Principal({
          id: new Id('123e4567-e89b-12d3-a456-426614174004'),
          kind: PrincipalKind.STUDENT,
          personId: new Id('123e4567-e89b-12d3-a456-426614174001'),
        });
        mockPrismaClient.principal.create.mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174004',
          kind: PrismaKind.STUDENT,
          personId: '123e4567-e89b-12d3-a456-426614174001',
        });

        // Act
        const result = await repository.create(principal);

        // Assert
        expect(result.getKind()).toBe(PrincipalKind.STUDENT);
      });

      it('新しいPrincipal（STAKEHOLDER）を作成できる', async () => {
        // Arrange
        const principal = new Principal({
          id: new Id('123e4567-e89b-12d3-a456-426614174004'),
          kind: PrincipalKind.STAKEHOLDER,
          personId: new Id('123e4567-e89b-12d3-a456-426614174001'),
        });
        mockPrismaClient.principal.create.mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174004',
          kind: PrismaKind.STAKEHOLDER,
          personId: '123e4567-e89b-12d3-a456-426614174001',
        });

        // Act
        const result = await repository.create(principal);

        // Assert
        expect(result.getKind()).toBe(PrincipalKind.STAKEHOLDER);
      });
    });

    describe('異常系', () => {
      it('DB作成に失敗した場合、エラーをスローする', async () => {
        // Arrange
        const principal = new Principal({
          id: new Id('123e4567-e89b-12d3-a456-426614174004'),
          kind: PrincipalKind.ADMIN,
          personId: new Id('123e4567-e89b-12d3-a456-426614174001'),
        });
        mockPrismaClient.principal.create.mockRejectedValue(
          new Error('Unique constraint violation'),
        );

        // Act & Assert
        await expect(repository.create(principal)).rejects.toThrow(
          'Unique constraint violation',
        );
      });
    });
  });

  describe('update', () => {
    describe('正常系', () => {
      it('既存のPrincipalを更新できる', async () => {
        // Arrange
        const principal = new Principal({
          id: new Id('123e4567-e89b-12d3-a456-426614174004'),
          kind: PrincipalKind.TEACHER,
          personId: new Id('123e4567-e89b-12d3-a456-426614174001'),
        });
        mockPrismaClient.principal.update.mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174004',
          kind: PrismaKind.TEACHER,
          personId: '123e4567-e89b-12d3-a456-426614174001',
        });

        // Act
        const result = await repository.update(principal);

        // Assert
        expect(mockPrismaClient.principal.update).toHaveBeenCalledWith({
          where: { id: '123e4567-e89b-12d3-a456-426614174004' },
          data: {
            kind: PrincipalKind.TEACHER,
            personId: '123e4567-e89b-12d3-a456-426614174001',
          },
        });
        expect(result.getKind()).toBe(PrincipalKind.TEACHER);
      });

      it('PrincipalのkindをADMINからSTUDENTに変更できる', async () => {
        // Arrange
        const principal = new Principal({
          id: new Id('123e4567-e89b-12d3-a456-426614174004'),
          kind: PrincipalKind.STUDENT,
          personId: new Id('123e4567-e89b-12d3-a456-426614174001'),
        });
        mockPrismaClient.principal.update.mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174004',
          kind: PrismaKind.STUDENT,
          personId: '123e4567-e89b-12d3-a456-426614174001',
        });

        // Act
        const result = await repository.update(principal);

        // Assert
        expect(result.getKind()).toBe(PrincipalKind.STUDENT);
      });
    });

    describe('異常系', () => {
      it('DB更新に失敗した場合、エラーをスローする', async () => {
        // Arrange
        const principal = new Principal({
          id: new Id('123e4567-e89b-12d3-a456-426614174004'),
          kind: PrincipalKind.TEACHER,
          personId: new Id('123e4567-e89b-12d3-a456-426614174001'),
        });
        mockPrismaClient.principal.update.mockRejectedValue(
          new Error('Record not found'),
        );

        // Act & Assert
        await expect(repository.update(principal)).rejects.toThrow(
          'Record not found',
        );
      });
    });
  });

  describe('delete', () => {
    describe('正常系', () => {
      it('指定されたpersonIdでPrincipalを削除できる', async () => {
        // Arrange
        const personId = new Id('123e4567-e89b-12d3-a456-426614174001');
        mockPrismaClient.principal.delete.mockResolvedValue({});

        // Act
        await repository.delete(personId);

        // Assert
        expect(mockPrismaClient.principal.delete).toHaveBeenCalledWith({
          where: { personId: '123e4567-e89b-12d3-a456-426614174001' },
        });
      });
    });

    describe('異常系', () => {
      it('削除に失敗した場合、エラーをスローする', async () => {
        // Arrange
        const personId = new Id('123e4567-e89b-12d3-a456-426614174001');
        mockPrismaClient.principal.delete.mockRejectedValue(
          new Error('Record not found'),
        );

        // Act & Assert
        await expect(repository.delete(personId)).rejects.toThrow(
          'Record not found',
        );
      });
    });
  });
});

describe('PrincipalQueryRepository', () => {
  let repository: PrincipalQueryRepository;
  let mockPrismaClient: any;

  beforeAll(() => {
    mockPrismaClient = {
      principal: {
        findUnique: jest.fn(),
      },
    };
    (PrismaClientSingleton as any).instance = mockPrismaClient;
    repository = new PrincipalQueryRepository(mockPrismaClient);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findByPersonId', () => {
    describe('正常系', () => {
      it('personIdでPrincipal（ADMIN）を検索できる', async () => {
        // Arrange
        const personId = '123e4567-e89b-12d3-a456-426614174001';
        mockPrismaClient.principal.findUnique.mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174004',
          kind: PrismaKind.ADMIN,
          personId: '123e4567-e89b-12d3-a456-426614174001',
        });

        // Act
        const result = await repository.findByPersonId(personId);

        // Assert
        expect(mockPrismaClient.principal.findUnique).toHaveBeenCalledWith({
          where: { personId: '123e4567-e89b-12d3-a456-426614174001' },
        });
        expect(result).toBeDefined();
        expect(result?.getId()).toBe('123e4567-e89b-12d3-a456-426614174004');
        expect(result?.getKind()).toBe(PrincipalKind.ADMIN);
        expect(result?.getPersonId()).toBe('123e4567-e89b-12d3-a456-426614174001');
      });

      it('personIdでPrincipal（TEACHER）を検索できる', async () => {
        // Arrange
        const personId = '123e4567-e89b-12d3-a456-426614174001';
        mockPrismaClient.principal.findUnique.mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174004',
          kind: PrismaKind.TEACHER,
          personId: '123e4567-e89b-12d3-a456-426614174001',
        });

        // Act
        const result = await repository.findByPersonId(personId);

        // Assert
        expect(result?.getKind()).toBe(PrincipalKind.TEACHER);
      });

      it('personIdでPrincipal（STUDENT）を検索できる', async () => {
        // Arrange
        const personId = '123e4567-e89b-12d3-a456-426614174001';
        mockPrismaClient.principal.findUnique.mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174004',
          kind: PrismaKind.STUDENT,
          personId: '123e4567-e89b-12d3-a456-426614174001',
        });

        // Act
        const result = await repository.findByPersonId(personId);

        // Assert
        expect(result?.getKind()).toBe(PrincipalKind.STUDENT);
      });

      it('personIdでPrincipal（STAKEHOLDER）を検索できる', async () => {
        // Arrange
        const personId = '123e4567-e89b-12d3-a456-426614174001';
        mockPrismaClient.principal.findUnique.mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174004',
          kind: PrismaKind.STAKEHOLDER,
          personId: '123e4567-e89b-12d3-a456-426614174001',
        });

        // Act
        const result = await repository.findByPersonId(personId);

        // Assert
        expect(result?.getKind()).toBe(PrincipalKind.STAKEHOLDER);
      });

      it('Principalが見つからない場合、undefinedを返す', async () => {
        // Arrange
        const personId = '999e4567-e89b-12d3-a456-426614174999';
        mockPrismaClient.principal.findUnique.mockResolvedValue(null);

        // Act
        const result = await repository.findByPersonId(personId);

        // Assert
        expect(mockPrismaClient.principal.findUnique).toHaveBeenCalledWith({
          where: { personId: '999e4567-e89b-12d3-a456-426614174999' },
        });
        expect(result).toBeUndefined();
      });
    });

    describe('異常系', () => {
      it('検索処理でエラーが発生した場合、エラーをスローする', async () => {
        // Arrange
        const personId = '123e4567-e89b-12d3-a456-426614174001';
        mockPrismaClient.principal.findUnique.mockRejectedValue(
          new Error('Query failed'),
        );

        // Act & Assert
        await expect(repository.findByPersonId(personId)).rejects.toThrow(
          'Query failed',
        );
      });
    });
  });
});
