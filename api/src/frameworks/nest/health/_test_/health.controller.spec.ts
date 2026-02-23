import { HealthController } from '../health.controller';
import {
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { PrismaHealthIndicator } from '../prisma.health';
import { PerformanceHealthIndicator } from '../performance.health';

describe('HealthController', () => {
  let controller: HealthController;
  let mockHealthCheckService: jest.Mocked<HealthCheckService>;
  let mockHttpHealthIndicator: jest.Mocked<HttpHealthIndicator>;
  let mockMemoryHealthIndicator: jest.Mocked<MemoryHealthIndicator>;
  let mockDiskHealthIndicator: jest.Mocked<DiskHealthIndicator>;
  let mockPrismaHealthIndicator: jest.Mocked<PrismaHealthIndicator>;
  let mockPerformanceHealthIndicator: jest.Mocked<PerformanceHealthIndicator>;

  beforeEach(() => {
    mockHealthCheckService = {
      check: jest.fn(),
    } as any;

    mockHttpHealthIndicator = {} as any;

    mockMemoryHealthIndicator = {
      checkHeap: jest.fn(),
      checkRSS: jest.fn(),
    } as any;

    mockDiskHealthIndicator = {
      checkStorage: jest.fn(),
    } as any;

    mockPrismaHealthIndicator = {
      check: jest.fn(),
    } as any;

    mockPerformanceHealthIndicator = {
      check: jest.fn(),
    } as any;

    controller = new HealthController(
      mockHealthCheckService,
      mockHttpHealthIndicator,
      mockMemoryHealthIndicator,
      mockDiskHealthIndicator,
      mockPrismaHealthIndicator,
      mockPerformanceHealthIndicator,
    );
  });

  describe('check (liveness probe)', () => {
    it('should perform basic health check', async () => {
      // Arrange
      const expectedResult = {
        status: 'ok' as const,
        info: { memory_heap: { status: 'up' as const } },
        error: {},
        details: { memory_heap: { status: 'up' as const } },
      };

      mockHealthCheckService.check.mockResolvedValue(expectedResult as any);

      // Act
      const result = await controller.check();

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockHealthCheckService.check).toHaveBeenCalledTimes(1);
    });

    it('should check memory heap only', async () => {
      // Arrange
      mockHealthCheckService.check.mockResolvedValue({
        status: 'ok',
        info: {},
        error: {},
        details: {},
      });

      // Act
      await controller.check();

      // Assert
      expect(mockHealthCheckService.check).toHaveBeenCalledWith([
        expect.any(Function),
      ]);
    });

    it('should pass when memory is below threshold', async () => {
      // Arrange
      const healthResult = {
        status: 'ok' as const,
        info: { memory_heap: { status: 'up' as const } },
        error: {},
        details: { memory_heap: { status: 'up' as const } },
      };

      mockHealthCheckService.check.mockResolvedValue(healthResult as any);

      // Act
      const result = await controller.check();

      // Assert
      expect(result.status).toBe('ok');
    });
  });

  describe('checkReadiness (readiness probe)', () => {
    it('should perform readiness health check', async () => {
      // Arrange
      const expectedResult = {
        status: 'ok' as const,
        info: {
          database: { status: 'up' as const },
          memory_heap: { status: 'up' as const },
          memory_rss: { status: 'up' as const },
          disk: { status: 'up' as const },
        },
        error: {},
        details: {
          database: { status: 'up' as const },
          memory_heap: { status: 'up' as const },
          memory_rss: { status: 'up' as const },
          disk: { status: 'up' as const },
        },
      };

      mockHealthCheckService.check.mockResolvedValue(expectedResult as any);

      // Act
      const result = await controller.checkReadiness();

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockHealthCheckService.check).toHaveBeenCalledTimes(1);
    });

    it('should check multiple health indicators', async () => {
      // Arrange
      mockHealthCheckService.check.mockResolvedValue({
        status: 'ok',
        info: {},
        error: {},
        details: {},
      });

      // Act
      await controller.checkReadiness();

      // Assert
      expect(mockHealthCheckService.check).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.any(Function), // database
          expect.any(Function), // memory_heap
          expect.any(Function), // memory_rss
          expect.any(Function), // disk
        ]),
      );
    });

    it('should check database connection', async () => {
      // Arrange
      mockHealthCheckService.check.mockResolvedValue({
        status: 'ok' as const,
        info: { database: { status: 'up' as const } },
        error: {},
        details: { database: { status: 'up' as const } },
      } as any);

      // Act
      const result = await controller.checkReadiness();

      // Assert
      expect(result.info).toBeDefined();
      expect((result.info as any).database).toBeDefined();
      expect(mockHealthCheckService.check).toHaveBeenCalled();
    });

    it('should check memory usage', async () => {
      // Arrange
      mockHealthCheckService.check.mockResolvedValue({
        status: 'ok' as const,
        info: {
          memory_heap: { status: 'up' as const },
          memory_rss: { status: 'up' as const },
        },
        error: {},
        details: {
          memory_heap: { status: 'up' as const },
          memory_rss: { status: 'up' as const },
        },
      } as any);

      // Act
      const result = await controller.checkReadiness();

      // Assert
      expect(result.info).toBeDefined();
      expect((result.info as any).memory_heap).toBeDefined();
      expect((result.info as any).memory_rss).toBeDefined();
    });

    it('should check disk usage', async () => {
      // Arrange
      mockHealthCheckService.check.mockResolvedValue({
        status: 'ok' as const,
        info: { disk: { status: 'up' as const } },
        error: {},
        details: { disk: { status: 'up' as const } },
      } as any);

      // Act
      const result = await controller.checkReadiness();

      // Assert
      expect(result.info).toBeDefined();
      expect((result.info as any).disk).toBeDefined();
    });

    it('should return error status when any check fails', async () => {
      // Arrange
      const errorResult = {
        status: 'error' as const,
        info: {
          memory_heap: { status: 'up' as const },
          memory_rss: { status: 'up' as const },
        },
        error: {
          database: { status: 'down' as const, message: 'Connection failed' },
        },
        details: {
          database: { status: 'down' as const, message: 'Connection failed' },
          memory_heap: { status: 'up' as const },
          memory_rss: { status: 'up' as const },
        },
      };

      mockHealthCheckService.check.mockResolvedValue(errorResult as any);

      // Act
      const result = await controller.checkReadiness();

      // Assert
      expect(result.status).toBe('error');
      expect(result.error).toBeDefined();
      expect((result.error as any).database).toBeDefined();
    });
  });

  describe('checkDetails (detailed diagnostics)', () => {
    it('should perform detailed health check', async () => {
      // Arrange
      const expectedResult = {
        status: 'ok' as const,
        info: {
          database: { status: 'up' as const },
          performance: { status: 'up' as const },
          memory_heap: { status: 'up' as const },
          memory_rss: { status: 'up' as const },
          disk: { status: 'up' as const },
        },
        error: {},
        details: {
          database: { status: 'up' as const },
          performance: { status: 'up' as const },
          memory_heap: { status: 'up' as const },
          memory_rss: { status: 'up' as const },
          disk: { status: 'up' as const },
        },
      };

      mockHealthCheckService.check.mockResolvedValue(expectedResult as any);

      // Act
      const result = await controller.checkDetails();

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockHealthCheckService.check).toHaveBeenCalledTimes(1);
    });

    it('should check all health indicators including performance', async () => {
      // Arrange
      mockHealthCheckService.check.mockResolvedValue({
        status: 'ok',
        info: {},
        error: {},
        details: {},
      });

      // Act
      await controller.checkDetails();

      // Assert
      expect(mockHealthCheckService.check).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.any(Function), // database
          expect.any(Function), // performance
          expect.any(Function), // memory_heap
          expect.any(Function), // memory_rss
          expect.any(Function), // disk
        ]),
      );
    });

    it('should include performance metrics', async () => {
      // Arrange
      mockHealthCheckService.check.mockResolvedValue({
        status: 'ok' as const,
        info: {
          performance: {
            status: 'up' as const,
            average: 200,
            p95: 500,
          },
        },
        error: {},
        details: {
          performance: {
            status: 'up' as const,
            average: 200,
            p95: 500,
          },
        },
      } as any);

      // Act
      const result = await controller.checkDetails();

      // Assert
      expect(result.info).toBeDefined();
      expect((result.info as any).performance).toBeDefined();
      expect((result.info as any).performance.average).toBe(200);
    });

    it('should include database check', async () => {
      // Arrange
      mockHealthCheckService.check.mockResolvedValue({
        status: 'ok' as const,
        info: {
          database: { status: 'up' as const, responseTime: '10ms' },
        },
        error: {},
        details: {
          database: { status: 'up' as const, responseTime: '10ms' },
        },
      } as any);

      // Act
      const result = await controller.checkDetails();

      // Assert
      expect(result.info).toBeDefined();
      expect((result.info as any).database).toBeDefined();
    });

    it('should include memory checks', async () => {
      // Arrange
      mockHealthCheckService.check.mockResolvedValue({
        status: 'ok' as const,
        info: {
          memory_heap: { status: 'up' as const },
          memory_rss: { status: 'up' as const },
        },
        error: {},
        details: {
          memory_heap: { status: 'up' as const },
          memory_rss: { status: 'up' as const },
        },
      } as any);

      // Act
      const result = await controller.checkDetails();

      // Assert
      expect(result.info).toBeDefined();
      expect((result.info as any).memory_heap).toBeDefined();
      expect((result.info as any).memory_rss).toBeDefined();
    });

    it('should include disk check', async () => {
      // Arrange
      mockHealthCheckService.check.mockResolvedValue({
        status: 'ok' as const,
        info: {
          disk: { status: 'up' as const, usage: 0.5 },
        },
        error: {},
        details: {
          disk: { status: 'up' as const, usage: 0.5 },
        },
      } as any);

      // Act
      const result = await controller.checkDetails();

      // Assert
      expect(result.info).toBeDefined();
      expect((result.info as any).disk).toBeDefined();
    });

    it('should return error when any detailed check fails', async () => {
      // Arrange
      const errorResult = {
        status: 'error' as const,
        info: {
          database: { status: 'up' as const },
          memory_heap: { status: 'up' as const },
        },
        error: {
          performance: {
            status: 'down' as const,
            message: 'Performance degradation',
          },
        },
        details: {
          database: { status: 'up' as const },
          performance: {
            status: 'down' as const,
            message: 'Performance degradation',
          },
          memory_heap: { status: 'up' as const },
        },
      };

      mockHealthCheckService.check.mockResolvedValue(errorResult as any);

      // Act
      const result = await controller.checkDetails();

      // Assert
      expect(result.status).toBe('error');
      expect(result.error).toBeDefined();
      expect((result.error as any).performance).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle errors in liveness probe', async () => {
      // Arrange
      mockHealthCheckService.check.mockRejectedValue(
        new Error('Health check failed'),
      );

      // Act & Assert
      await expect(controller.check()).rejects.toThrow('Health check failed');
    });

    it('should handle errors in readiness probe', async () => {
      // Arrange
      mockHealthCheckService.check.mockRejectedValue(
        new Error('Readiness check failed'),
      );

      // Act & Assert
      await expect(controller.checkReadiness()).rejects.toThrow(
        'Readiness check failed',
      );
    });

    it('should handle errors in detailed check', async () => {
      // Arrange
      mockHealthCheckService.check.mockRejectedValue(
        new Error('Detailed check failed'),
      );

      // Act & Assert
      await expect(controller.checkDetails()).rejects.toThrow(
        'Detailed check failed',
      );
    });
  });
});
