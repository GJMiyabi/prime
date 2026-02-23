import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

// Prisma Clientをモック
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(),
  };
});

// argon2をモック
jest.mock('argon2', () => ({
  hash: jest.fn(),
}));

describe('Seed Script', () => {
  let mockPrisma: any;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Prismaクライアントのモック
    mockPrisma = {
      organization: {
        create: jest.fn(),
      },
      facility: {
        create: jest.fn(),
      },
      person: {
        create: jest.fn(),
      },
      contactAddress: {
        create: jest.fn(),
      },
      principal: {
        create: jest.fn(),
      },
      account: {
        create: jest.fn(),
      },
      $disconnect: jest.fn().mockResolvedValue(undefined),
    };

    (PrismaClient as jest.Mock).mockImplementation(() => mockPrisma);

    // argon2のモック
    (argon2.hash as jest.Mock).mockImplementation((password: string) =>
      Promise.resolve(`hashed_${password}`),
    );

    // console.log/errorのスパイ
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    jest.clearAllMocks();
  });

  describe('main function', () => {
    it('should create organization successfully', async () => {
      // Arrange
      const mockOrg = {
        id: 'org-1',
        name: 'サンプル組織',
        IDNumber: 'ORG-001',
      };
      const mockFacility = {
        id: 'facility-1',
        name: '第一施設',
        IDNumber: 'FAC-001',
        organizationId: 'org-1',
      };
      const mockPerson = {
        id: 'person-1',
        name: '田中太郎',
        organizationId: 'org-1',
      };

      mockPrisma.organization.create.mockResolvedValue(mockOrg);
      mockPrisma.facility.create.mockResolvedValue(mockFacility);
      mockPrisma.person.create.mockResolvedValue(mockPerson);
      mockPrisma.contactAddress.create.mockResolvedValue({});
      mockPrisma.principal.create.mockResolvedValue({
        id: 'principal-1',
      });
      mockPrisma.account.create.mockResolvedValue({});

      // Act
      const { main } = await import('../seed');
      await main(mockPrisma);

      // Assert
      expect(mockPrisma.organization.create).toHaveBeenCalledWith({
        data: {
          name: 'サンプル組織',
          IDNumber: 'ORG-001',
        },
      });
    });

    it('should create facility with organization reference', async () => {
      // Arrange
      const mockOrg = {
        id: 'org-123',
        name: 'サンプル組織',
        IDNumber: 'ORG-001',
      };
      const mockFacility = {
        id: 'facility-1',
        name: '第一施設',
        IDNumber: 'FAC-001',
        organizationId: 'org-123',
      };
      const mockPerson = {
        id: 'person-1',
        name: '田中太郎',
        organizationId: 'org-123',
      };

      mockPrisma.organization.create.mockResolvedValue(mockOrg);
      mockPrisma.facility.create.mockResolvedValue(mockFacility);
      mockPrisma.person.create.mockResolvedValue(mockPerson);
      mockPrisma.contactAddress.create.mockResolvedValue({});
      mockPrisma.principal.create.mockResolvedValue({
        id: 'principal-1',
      });
      mockPrisma.account.create.mockResolvedValue({});

      // Act
      const { main } = await import('../seed');
      await main(mockPrisma);

      // Assert
      expect(mockPrisma.facility.create).toHaveBeenCalledWith({
        data: {
          name: '第一施設',
          IDNumber: 'FAC-001',
          organizationId: 'org-123',
        },
      });
    });

    it('should create person with facility connection', async () => {
      // Arrange
      const mockOrg = {
        id: 'org-1',
        name: 'サンプル組織',
        IDNumber: 'ORG-001',
      };
      const mockFacility = {
        id: 'facility-456',
        name: '第一施設',
        IDNumber: 'FAC-001',
        organizationId: 'org-1',
      };
      const mockPerson = {
        id: 'person-1',
        name: '田中太郎',
        organizationId: 'org-1',
      };

      mockPrisma.organization.create.mockResolvedValue(mockOrg);
      mockPrisma.facility.create.mockResolvedValue(mockFacility);
      mockPrisma.person.create.mockResolvedValue(mockPerson);
      mockPrisma.contactAddress.create.mockResolvedValue({});
      mockPrisma.principal.create.mockResolvedValue({
        id: 'principal-1',
      });
      mockPrisma.account.create.mockResolvedValue({});

      // Act
      const { main } = await import('../seed');
      await main(mockPrisma);

      // Assert
      expect(mockPrisma.person.create).toHaveBeenCalledWith({
        data: {
          name: '田中太郎',
          organizationId: 'org-1',
          facilities: {
            connect: { id: 'facility-456' },
          },
        },
      });
    });

    it('should create contact address', async () => {
      // Arrange
      const mockOrg = {
        id: 'org-1',
        name: 'サンプル組織',
        IDNumber: 'ORG-001',
      };
      const mockFacility = {
        id: 'facility-1',
        name: '第一施設',
        IDNumber: 'FAC-001',
        organizationId: 'org-1',
      };
      const mockPerson = {
        id: 'person-789',
        name: '田中太郎',
        organizationId: 'org-1',
      };

      mockPrisma.organization.create.mockResolvedValue(mockOrg);
      mockPrisma.facility.create.mockResolvedValue(mockFacility);
      mockPrisma.person.create.mockResolvedValue(mockPerson);
      mockPrisma.contactAddress.create.mockResolvedValue({});
      mockPrisma.principal.create.mockResolvedValue({
        id: 'principal-1',
      });
      mockPrisma.account.create.mockResolvedValue({});

      // Act
      const { main } = await import('../seed');
      await main(mockPrisma);

      // Assert
      expect(mockPrisma.contactAddress.create).toHaveBeenCalledWith({
        data: {
          type: 'EMAIL',
          value: 'tanaka@example.com',
          personId: 'person-789',
          organizationId: 'org-1',
          facilityId: 'facility-1',
        },
      });
    });

    it('should create admin account with hashed password', async () => {
      // Arrange
      const mockOrg = {
        id: 'org-1',
        name: 'サンプル組織',
        IDNumber: 'ORG-001',
      };
      const mockFacility = {
        id: 'facility-1',
        name: '第一施設',
        IDNumber: 'FAC-001',
        organizationId: 'org-1',
      };
      const mockPerson = {
        id: 'person-1',
        name: '田中太郎',
        organizationId: 'org-1',
      };
      const mockAdminPerson = { id: 'admin-person-1', name: '管理者' };
      const mockAdminPrincipal = {
        id: 'admin-principal-1',
        personId: 'admin-person-1',
        kind: 'ADMIN',
      };

      mockPrisma.organization.create.mockResolvedValue(mockOrg);
      mockPrisma.facility.create.mockResolvedValue(mockFacility);
      mockPrisma.person.create
        .mockResolvedValueOnce(mockPerson)
        .mockResolvedValueOnce(mockAdminPerson)
        .mockResolvedValueOnce({ id: 'teacher-person-1' })
        .mockResolvedValueOnce({ id: 'student-person-1' });
      mockPrisma.contactAddress.create.mockResolvedValue({});
      mockPrisma.principal.create
        .mockResolvedValueOnce(mockAdminPrincipal)
        .mockResolvedValueOnce({ id: 'teacher-principal-1' })
        .mockResolvedValueOnce({ id: 'student-principal-1' });
      mockPrisma.account.create.mockResolvedValue({});

      // Act
      const { main } = await import('../seed');
      await main(mockPrisma);

      // Assert
      expect(argon2.hash).toHaveBeenCalledWith('admin123');
      expect(mockPrisma.account.create).toHaveBeenCalledWith({
        data: {
          principalId: 'admin-principal-1',
          username: 'admin',
          password: 'hashed_admin123',
          email: 'admin@example.com',
          isActive: true,
        },
      });
    });

    it('should create teacher account with hashed password', async () => {
      // Arrange
      const mockOrg = {
        id: 'org-1',
        name: 'サンプル組織',
        IDNumber: 'ORG-001',
      };
      const mockFacility = {
        id: 'facility-1',
        name: '第一施設',
        IDNumber: 'FAC-001',
        organizationId: 'org-1',
      };
      const mockPerson = {
        id: 'person-1',
        name: '田中太郎',
        organizationId: 'org-1',
      };
      const mockTeacherPerson = {
        id: 'teacher-person-1',
        name: '山田花子',
        organizationId: 'org-1',
      };
      const mockTeacherPrincipal = {
        id: 'teacher-principal-1',
        personId: 'teacher-person-1',
        kind: 'TEACHER',
      };

      mockPrisma.organization.create.mockResolvedValue(mockOrg);
      mockPrisma.facility.create.mockResolvedValue(mockFacility);
      mockPrisma.person.create
        .mockResolvedValueOnce(mockPerson)
        .mockResolvedValueOnce({ id: 'admin-person-1' })
        .mockResolvedValueOnce(mockTeacherPerson)
        .mockResolvedValueOnce({ id: 'student-person-1' });
      mockPrisma.contactAddress.create.mockResolvedValue({});
      mockPrisma.principal.create
        .mockResolvedValueOnce({ id: 'admin-principal-1' })
        .mockResolvedValueOnce(mockTeacherPrincipal)
        .mockResolvedValueOnce({ id: 'student-principal-1' });
      mockPrisma.account.create.mockResolvedValue({});

      // Act
      const { main } = await import('../seed');
      await main(mockPrisma);

      // Assert
      expect(argon2.hash).toHaveBeenCalledWith('teacher123');
      expect(mockPrisma.account.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            principalId: 'teacher-principal-1',
            username: 'teacher',
            password: 'hashed_teacher123',
            email: 'yamada@example.com',
            isActive: true,
          }),
        }),
      );
    });

    it('should create student account with hashed password', async () => {
      // Arrange
      const mockOrg = {
        id: 'org-1',
        name: 'サンプル組織',
        IDNumber: 'ORG-001',
      };
      const mockFacility = {
        id: 'facility-1',
        name: '第一施設',
        IDNumber: 'FAC-001',
        organizationId: 'org-1',
      };
      const mockPerson = {
        id: 'person-1',
        name: '田中太郎',
        organizationId: 'org-1',
      };
      const mockStudentPerson = {
        id: 'student-person-1',
        name: '佐藤次郎',
        organizationId: 'org-1',
      };
      const mockStudentPrincipal = {
        id: 'student-principal-1',
        personId: 'student-person-1',
        kind: 'STUDENT',
      };

      mockPrisma.organization.create.mockResolvedValue(mockOrg);
      mockPrisma.facility.create.mockResolvedValue(mockFacility);
      mockPrisma.person.create
        .mockResolvedValueOnce(mockPerson)
        .mockResolvedValueOnce({ id: 'admin-person-1' })
        .mockResolvedValueOnce({ id: 'teacher-person-1' })
        .mockResolvedValueOnce(mockStudentPerson);
      mockPrisma.contactAddress.create.mockResolvedValue({});
      mockPrisma.principal.create
        .mockResolvedValueOnce({ id: 'admin-principal-1' })
        .mockResolvedValueOnce({ id: 'teacher-principal-1' })
        .mockResolvedValueOnce(mockStudentPrincipal);
      mockPrisma.account.create.mockResolvedValue({});

      // Act
      const { main } = await import('../seed');
      await main(mockPrisma);

      // Assert
      expect(argon2.hash).toHaveBeenCalledWith('student123');
      expect(mockPrisma.account.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            principalId: 'student-principal-1',
            username: 'student',
            password: 'hashed_student123',
            email: 'sato@example.com',
            isActive: true,
          }),
        }),
      );
    });

    it('should log account creation messages', async () => {
      // Arrange
      const mockOrg = {
        id: 'org-1',
        name: 'サンプル組織',
        IDNumber: 'ORG-001',
      };
      const mockFacility = {
        id: 'facility-1',
        name: '第一施設',
        IDNumber: 'FAC-001',
        organizationId: 'org-1',
      };
      const mockPerson = {
        id: 'person-1',
        name: '田中太郎',
        organizationId: 'org-1',
      };

      mockPrisma.organization.create.mockResolvedValue(mockOrg);
      mockPrisma.facility.create.mockResolvedValue(mockFacility);
      mockPrisma.person.create.mockResolvedValue(mockPerson);
      mockPrisma.contactAddress.create.mockResolvedValue({});
      mockPrisma.principal.create.mockResolvedValue({
        id: 'principal-1',
      });
      mockPrisma.account.create.mockResolvedValue({});

      // Act
      const { main } = await import('../seed');
      await main(mockPrisma);

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '🔐 アカウントデータを作成中...',
      );
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ seed 完了');
      expect(consoleLogSpy).toHaveBeenCalledWith('🔐 作成されたアカウント:');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '  管理者: username=admin, password=admin123',
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '  教師: username=teacher, password=teacher123',
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '  学生: username=student, password=student123',
      );
    });

    it('should create all three accounts', async () => {
      // Arrange
      const mockOrg = {
        id: 'org-1',
        name: 'サンプル組織',
        IDNumber: 'ORG-001',
      };
      const mockFacility = {
        id: 'facility-1',
        name: '第一施設',
        IDNumber: 'FAC-001',
        organizationId: 'org-1',
      };
      const mockPerson = {
        id: 'person-1',
        name: '田中太郎',
        organizationId: 'org-1',
      };

      mockPrisma.organization.create.mockResolvedValue(mockOrg);
      mockPrisma.facility.create.mockResolvedValue(mockFacility);
      mockPrisma.person.create.mockResolvedValue(mockPerson);
      mockPrisma.contactAddress.create.mockResolvedValue({});
      mockPrisma.principal.create.mockResolvedValue({
        id: 'principal-1',
      });
      mockPrisma.account.create.mockResolvedValue({});

      // Act
      const { main } = await import('../seed');
      await main(mockPrisma);

      // Assert
      expect(mockPrisma.account.create).toHaveBeenCalledTimes(3);
    });

    it('should hash all three passwords', async () => {
      // Arrange
      const mockOrg = {
        id: 'org-1',
        name: 'サンプル組織',
        IDNumber: 'ORG-001',
      };
      const mockFacility = {
        id: 'facility-1',
        name: '第一施設',
        IDNumber: 'FAC-001',
        organizationId: 'org-1',
      };
      const mockPerson = {
        id: 'person-1',
        name: '田中太郎',
        organizationId: 'org-1',
      };

      mockPrisma.organization.create.mockResolvedValue(mockOrg);
      mockPrisma.facility.create.mockResolvedValue(mockFacility);
      mockPrisma.person.create.mockResolvedValue(mockPerson);
      mockPrisma.contactAddress.create.mockResolvedValue({});
      mockPrisma.principal.create.mockResolvedValue({
        id: 'principal-1',
      });
      mockPrisma.account.create.mockResolvedValue({});

      // Act
      const { main } = await import('../seed');
      await main(mockPrisma);

      // Assert
      expect(argon2.hash).toHaveBeenCalledTimes(3);
      expect(argon2.hash).toHaveBeenCalledWith('admin123');
      expect(argon2.hash).toHaveBeenCalledWith('teacher123');
      expect(argon2.hash).toHaveBeenCalledWith('student123');
    });
  });

  describe('Error Handling', () => {
    it('should throw error on database failure', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      mockPrisma.organization.create.mockRejectedValue(error);

      // Act & Assert
      const { main } = await import('../seed');
      await expect(main(mockPrisma)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should throw error when account creation fails', async () => {
      // Arrange
      const mockOrg = {
        id: 'org-1',
        name: 'サンプル組織',
        IDNumber: 'ORG-001',
      };
      const mockFacility = {
        id: 'facility-1',
        name: '第一施設',
        IDNumber: 'FAC-001',
        organizationId: 'org-1',
      };
      const mockPerson = {
        id: 'person-1',
        name: '田中太郎',
        organizationId: 'org-1',
      };
      const error = new Error('Account creation failed');

      mockPrisma.organization.create.mockResolvedValue(mockOrg);
      mockPrisma.facility.create.mockResolvedValue(mockFacility);
      mockPrisma.person.create.mockResolvedValue(mockPerson);
      mockPrisma.contactAddress.create.mockResolvedValue({});
      mockPrisma.principal.create.mockRejectedValue(error);

      // Act & Assert
      const { main } = await import('../seed');
      await expect(main(mockPrisma)).rejects.toThrow('Account creation failed');
    });
  });

  describe('Integration', () => {
    it('should create complete data structure', async () => {
      // Arrange
      const mockOrg = {
        id: 'org-1',
        name: 'サンプル組織',
        IDNumber: 'ORG-001',
      };
      const mockFacility = {
        id: 'facility-1',
        name: '第一施設',
        IDNumber: 'FAC-001',
        organizationId: 'org-1',
      };
      const mockPerson = {
        id: 'person-1',
        name: '田中太郎',
        organizationId: 'org-1',
      };

      mockPrisma.organization.create.mockResolvedValue(mockOrg);
      mockPrisma.facility.create.mockResolvedValue(mockFacility);
      mockPrisma.person.create.mockResolvedValue(mockPerson);
      mockPrisma.contactAddress.create.mockResolvedValue({});
      mockPrisma.principal.create.mockResolvedValue({
        id: 'principal-1',
      });
      mockPrisma.account.create.mockResolvedValue({});

      // Act
      const { main } = await import('../seed');
      await main(mockPrisma);

      // Assert
      expect(mockPrisma.organization.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.facility.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.person.create).toHaveBeenCalledTimes(4); // 田中太郎 + 3 accounts
      expect(mockPrisma.contactAddress.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.principal.create).toHaveBeenCalledTimes(3);
      expect(mockPrisma.account.create).toHaveBeenCalledTimes(3);
    });
  });
});
