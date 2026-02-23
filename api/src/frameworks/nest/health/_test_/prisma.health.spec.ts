import { PrismaHealthIndicator } from '../prisma.health';
import { HealthCheckError } from '@nestjs/terminus';
import { PrismaClient } from '@prisma/client';

// PrismaClientSingletonをモック
jest.mock('src/interface-adapters/shared/prisma-client', () => ({
  PrismaClientSingleton: {
    instance: {
      $queryRaw: jest.fn(),
    },
  },
}));

describe('PrismaHealthIndicator', () => {
  let indicator: PrismaHealthIndicator;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    indicator = new PrismaHealthIndicator();
    // @ts-expect-error - Accessing private property for testing
    mockPrisma = indicator.prisma as jest.Mocked<PrismaClient>;
    jest.clearAllMocks();
  });

  describe('check', () => {
    it('should return healthy status when database is accessible', async () => {
      // Arrange
      (mockPrisma.$queryRaw as jest.Mock).mockResolvedValue([
        { '?column?': 1 },
      ]);
      const key = 'database';

      // Act
      const result = await indicator.check(key);

      // Assert
      expect(result).toEqual({
        database: {
          status: 'up',
          message: 'Database connection is healthy',
        },
      });
      expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('should throw HealthCheckError when database is not accessible', async () => {
      // Arrange
      const error = new Error('Connection refused');
      (mockPrisma.$queryRaw as jest.Mock).mockRejectedValue(error);
      const key = 'database';

      // Act & Assert
      await expect(indicator.check(key)).rejects.toThrow(HealthCheckError);
      await expect(indicator.check(key)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should include error message in failed health check', async () => {
      // Arrange
      const errorMessage = 'ECONNREFUSED: Connection refused';
      (mockPrisma.$queryRaw as jest.Mock).mockRejectedValue(
        new Error(errorMessage),
      );
      const key = 'db';

      // Act & Assert
      try {
        await indicator.check(key);
        fail('Should have thrown HealthCheckError');
      } catch (error) {
        expect(error).toBeInstanceOf(HealthCheckError);
        const healthError = error as HealthCheckError;
        expect(healthError.causes).toEqual({
          db: {
            status: 'down',
            message: errorMessage,
          },
        });
      }
    });

    it('should handle non-Error objects', async () => {
      // Arrange
      (mockPrisma.$queryRaw as jest.Mock).mockRejectedValue(
        'String error message',
      );
      const key = 'database';

      // Act & Assert
      try {
        await indicator.check(key);
        fail('Should have thrown HealthCheckError');
      } catch (error) {
        expect(error).toBeInstanceOf(HealthCheckError);
        const healthError = error as HealthCheckError;
        expect(healthError.causes).toEqual({
          database: {
            status: 'down',
            message: 'Unknown error',
          },
        });
      }
    });

    it('should work with different key names', async () => {
      // Arrange
      (mockPrisma.$queryRaw as jest.Mock).mockResolvedValue([
        { '?column?': 1 },
      ]);
      const key = 'postgres';

      // Act
      const result = await indicator.check(key);

      // Assert
      expect(result).toEqual({
        postgres: {
          status: 'up',
          message: 'Database connection is healthy',
        },
      });
    });
  });

  describe('getDetails', () => {
    it('should return detailed health information with response time', async () => {
      // Arrange
      (mockPrisma.$queryRaw as jest.Mock).mockResolvedValue([
        { '?column?': 1 },
      ]);
      const key = 'database';

      // Act
      const result = await indicator.getDetails(key);

      // Assert
      expect(result.database.status).toBe('up');
      expect(result.database).toHaveProperty('message', 'Database is healthy');
      expect(result.database).toHaveProperty('responseTime');
      expect(typeof (result.database as any).responseTime).toBe('string');
      expect((result.database as any).responseTime).toMatch(/\d+ms/);
    });

    it('should measure response time accurately', async () => {
      // Arrange
      (mockPrisma.$queryRaw as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve([{ '?': 1 }]), 100),
          ),
      );
      const key = 'db';

      // Act
      const result = await indicator.getDetails(key);

      // Assert
      const responseTime = parseInt(
        (result.db as any).responseTime.replace('ms', ''),
      );
      expect(responseTime).toBeGreaterThanOrEqual(90); // Allow some tolerance
    });

    it('should throw HealthCheckError when database check fails', async () => {
      // Arrange
      const error = new Error('Timeout');
      (mockPrisma.$queryRaw as jest.Mock).mockRejectedValue(error);
      const key = 'database';

      // Act & Assert
      await expect(indicator.getDetails(key)).rejects.toThrow(HealthCheckError);
      await expect(indicator.getDetails(key)).rejects.toThrow(
        'Database check failed',
      );
    });

    it('should include error details in failed check', async () => {
      // Arrange
      (mockPrisma.$queryRaw as jest.Mock).mockRejectedValue(
        new Error('Connection timeout'),
      );
      const key = 'db';

      // Act & Assert
      try {
        await indicator.getDetails(key);
        fail('Should have thrown HealthCheckError');
      } catch (error) {
        expect(error).toBeInstanceOf(HealthCheckError);
        const healthError = error as HealthCheckError;
        expect(healthError.causes.db.status).toBe('down');
        expect(healthError.causes.db).toHaveProperty(
          'message',
          'Connection timeout',
        );
      }
    });
  });
});
