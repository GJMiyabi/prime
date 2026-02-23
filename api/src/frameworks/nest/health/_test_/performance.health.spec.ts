import { PerformanceHealthIndicator } from '../performance.health';
import { PerformanceInterceptor } from '../../shared/interceptors/performance.interceptor';
import { HealthCheckError } from '@nestjs/terminus';

describe('PerformanceHealthIndicator', () => {
  let indicator: PerformanceHealthIndicator;
  let mockPerformanceInterceptor: jest.Mocked<PerformanceInterceptor>;

  beforeEach(() => {
    mockPerformanceInterceptor = {
      getStatistics: jest.fn(),
    } as any;

    indicator = new PerformanceHealthIndicator(mockPerformanceInterceptor);
  });

  describe('check', () => {
    it('should return healthy status when performance is good', async () => {
      // Arrange
      const stats = {
        total: 100,
        average: 200, // 200ms
        p50: 150,
        p95: 500, // 500ms
        p99: 800,
        slowRequests: 5, // 5% slow
      };
      mockPerformanceInterceptor.getStatistics.mockReturnValue(stats);
      const key = 'performance';

      // Act
      const result = await indicator.check(key);

      // Assert
      expect(result).toEqual({
        performance: {
          status: 'up',
          ...stats,
          message: 'Performance is healthy',
        },
      });
    });

    it('should throw HealthCheckError when average response time is too high', async () => {
      // Arrange
      const stats = {
        total: 100,
        average: 1500, // 1.5 seconds (exceeds 1000ms threshold)
        p50: 1400,
        p95: 2000,
        p99: 3000,
        slowRequests: 20,
      };
      mockPerformanceInterceptor.getStatistics.mockReturnValue(stats);
      const key = 'performance';

      // Act & Assert
      await expect(indicator.check(key)).rejects.toThrow(HealthCheckError);
      await expect(indicator.check(key)).rejects.toThrow(
        'Performance degradation detected',
      );
    });

    it('should throw HealthCheckError when p95 exceeds threshold', async () => {
      // Arrange
      const stats = {
        total: 100,
        average: 500, // Good average
        p50: 400,
        p95: 3500, // Exceeds 3000ms threshold
        p99: 4000,
        slowRequests: 8,
      };
      mockPerformanceInterceptor.getStatistics.mockReturnValue(stats);
      const key = 'performance';

      // Act & Assert
      try {
        await indicator.check(key);
        fail('Should have thrown HealthCheckError');
      } catch (error) {
        expect(error).toBeInstanceOf(HealthCheckError);
        const healthError = error as HealthCheckError;
        expect(healthError.causes.performance.status).toBe('down');
        expect(healthError.causes.performance).toHaveProperty(
          'message',
          'Performance is below acceptable thresholds',
        );
        expect(healthError.causes.performance).toHaveProperty('average', 500);
        expect(healthError.causes.performance).toHaveProperty('p95', 3500);
      }
    });

    it('should throw HealthCheckError when slow requests exceed 10%', async () => {
      // Arrange
      const stats = {
        total: 100,
        average: 800, // Good average
        p50: 600,
        p95: 2000, // Good p95
        p99: 2500,
        slowRequests: 15, // 15% exceeds 10% threshold
      };
      mockPerformanceInterceptor.getStatistics.mockReturnValue(stats);
      const key = 'performance';

      // Act & Assert
      try {
        await indicator.check(key);
        fail('Should have thrown HealthCheckError');
      } catch (error) {
        expect(error).toBeInstanceOf(HealthCheckError);
        const healthError = error as HealthCheckError;
        expect(healthError.causes.performance.status).toBe('down');
        expect(healthError.causes.performance).toHaveProperty(
          'slowRequests',
          15,
        );
      }
    });

    it('should fail when slow requests are exactly at 10%', async () => {
      // Arrange
      const stats = {
        total: 100,
        average: 500,
        p50: 400,
        p95: 1500,
        p99: 2000,
        slowRequests: 10, // Exactly 10% (fails because condition is < not <=)
      };
      mockPerformanceInterceptor.getStatistics.mockReturnValue(stats);
      const key = 'performance';

      // Act & Assert
      await expect(indicator.check(key)).rejects.toThrow(HealthCheckError);
    });

    it('should pass with all metrics at boundaries', async () => {
      // Arrange
      const stats = {
        total: 100,
        average: 999, // Just under 1000ms
        p50: 800,
        p95: 2999, // Just under 3000ms
        p99: 3500,
        slowRequests: 9, // Just under 10%
      };
      mockPerformanceInterceptor.getStatistics.mockReturnValue(stats);
      const key = 'performance';

      // Act
      const result = await indicator.check(key);

      // Assert
      expect(result.performance.status).toBe('up');
      expect(result.performance.message).toBe('Performance is healthy');
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      mockPerformanceInterceptor.getStatistics.mockImplementation(() => {
        throw new Error('Unexpected error in statistics');
      });
      const key = 'performance';

      // Act & Assert
      try {
        await indicator.check(key);
        fail('Should have thrown HealthCheckError');
      } catch (error) {
        expect(error).toBeInstanceOf(HealthCheckError);
        const healthError = error as HealthCheckError;
        expect(healthError.message).toBe('Performance check failed');
        expect(healthError.causes.performance).toHaveProperty(
          'message',
          'Unexpected error in statistics',
        );
      }
    });

    it('should handle non-Error objects', async () => {
      // Arrange
      mockPerformanceInterceptor.getStatistics.mockImplementation(() => {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw 'String error';
      });
      const key = 'performance';

      // Act & Assert
      try {
        await indicator.check(key);
        fail('Should have thrown HealthCheckError');
      } catch (error) {
        expect(error).toBeInstanceOf(HealthCheckError);
        const healthError = error as HealthCheckError;
        expect(healthError.causes.performance).toHaveProperty(
          'message',
          'Unknown error',
        );
      }
    });

    it('should work with different key names', async () => {
      // Arrange
      const stats = {
        total: 50,
        average: 300,
        p50: 250,
        p95: 800,
        p99: 1000,
        slowRequests: 2,
      };
      mockPerformanceInterceptor.getStatistics.mockReturnValue(stats);
      const key = 'app-performance';

      // Act
      const result = await indicator.check(key);

      // Assert
      expect(result['app-performance']).toBeDefined();
      expect(result['app-performance'].status).toBe('up');
    });

    it('should include all stats in response', async () => {
      // Arrange
      const stats = {
        total: 200,
        average: 450,
        p50: 400,
        p95: 1200,
        p99: 1800,
        slowRequests: 12,
      };
      mockPerformanceInterceptor.getStatistics.mockReturnValue(stats);
      const key = 'perf';

      // Act
      const result = await indicator.check(key);

      // Assert
      expect(result.perf).toMatchObject({
        status: 'up',
        total: 200,
        average: 450,
        p50: 400,
        p95: 1200,
        p99: 1800,
        slowRequests: 12,
        message: 'Performance is healthy',
      });
    });

    it('should fail when multiple thresholds are exceeded', async () => {
      // Arrange
      const stats = {
        total: 100,
        average: 1200, // Exceeds 1000ms
        p50: 1100,
        p95: 3500, // Exceeds 3000ms
        p99: 4000,
        slowRequests: 25, // Exceeds 10%
      };
      mockPerformanceInterceptor.getStatistics.mockReturnValue(stats);
      const key = 'performance';

      // Act & Assert
      try {
        await indicator.check(key);
        fail('Should have thrown HealthCheckError');
      } catch (error) {
        expect(error).toBeInstanceOf(HealthCheckError);
        const healthError = error as HealthCheckError;
        expect(healthError.causes.performance.status).toBe('down');
        // All bad metrics should be included
        expect(healthError.causes.performance).toHaveProperty('average', 1200);
        expect(healthError.causes.performance).toHaveProperty('p95', 3500);
        expect(healthError.causes.performance).toHaveProperty(
          'slowRequests',
          25,
        );
      }
    });
  });
});
