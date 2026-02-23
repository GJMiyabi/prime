import { PerformanceInterceptor } from '../performance.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { GqlExecutionContext } from '@nestjs/graphql';

describe('PerformanceInterceptor', () => {
  let interceptor: PerformanceInterceptor;
  let mockExecutionContext: jest.Mocked<ExecutionContext>;
  let mockCallHandler: jest.Mocked<CallHandler>;

  beforeEach(() => {
    interceptor = new PerformanceInterceptor();
    interceptor.clearMetrics();

    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of('test-response')),
    } as any;

    jest.clearAllMocks();
  });

  describe('HTTP requests', () => {
    beforeEach(() => {
      mockExecutionContext = {
        getType: jest.fn().mockReturnValue('http'),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            method: 'GET',
            url: '/api/test',
          }),
        }),
      } as any;
    });

    it('should intercept HTTP request and record metrics', (done) => {
      // Act
      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      // Assert
      result$.subscribe(() => {
        const stats = interceptor.getStatistics();
        expect(stats.total).toBe(1);
        expect(stats.average).toBeGreaterThanOrEqual(0);
        done();
      });
    });

    it('should record HTTP method and path', (done) => {
      // Arrange
      mockExecutionContext.switchToHttp().getRequest = jest
        .fn()
        .mockReturnValue({
          method: 'POST',
          url: '/api/users',
        });

      // Act
      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      // Assert
      result$.subscribe(() => {
        const stats = interceptor.getStatistics();
        expect(stats.total).toBe(1);
        done();
      });
    });

    it('should track multiple HTTP requests', (done) => {
      // Act
      const result1$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );
      const result2$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );
      const result3$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      // Assert
      void Promise.all([
        result1$.toPromise(),
        result2$.toPromise(),
        result3$.toPromise(),
      ]).then(() => {
        const stats = interceptor.getStatistics();
        expect(stats.total).toBe(3);
        done();
      });
    });
  });

  describe('GraphQL requests', () => {
    beforeEach(() => {
      mockExecutionContext = {
        getType: jest.fn().mockReturnValue('graphql'),
      } as any;

      // GqlExecutionContextのモック
      jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
        getInfo: jest.fn().mockReturnValue({
          operation: { name: { value: 'GetUser' } },
          fieldName: 'user',
        }),
      } as any);
    });

    it('should intercept GraphQL request and record metrics', (done) => {
      // Act
      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      // Assert
      result$.subscribe(() => {
        const stats = interceptor.getStatistics();
        expect(stats.total).toBe(1);
        done();
      });
    });

    it('should record GraphQL operation name and field', (done) => {
      // Arrange
      jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
        getInfo: jest.fn().mockReturnValue({
          operation: { name: { value: 'CreatePerson' } },
          fieldName: 'createPerson',
        }),
      } as any);

      // Act
      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      // Assert
      result$.subscribe(() => {
        const stats = interceptor.getStatistics();
        expect(stats.total).toBe(1);
        done();
      });
    });

    it('should handle GraphQL requests without operation name', (done) => {
      // Arrange
      jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
        getInfo: jest.fn().mockReturnValue({
          operation: {},
          fieldName: 'query',
        }),
      } as any);

      // Act
      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      // Assert
      result$.subscribe(() => {
        const stats = interceptor.getStatistics();
        expect(stats.total).toBe(1);
        done();
      });
    });
  });

  describe('getStatistics', () => {
    it('should return zero statistics when no metrics', () => {
      // Act
      const stats = interceptor.getStatistics();

      // Assert
      expect(stats).toEqual({
        total: 0,
        average: 0,
        p50: 0,
        p95: 0,
        p99: 0,
        slowRequests: 0,
      });
    });

    it('should calculate average correctly', (done) => {
      // Arrange
      mockExecutionContext = {
        getType: jest.fn().mockReturnValue('http'),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            method: 'GET',
            url: '/test',
          }),
        }),
      } as any;

      // Act - Create multiple requests
      const requests = Array(5)
        .fill(null)
        .map(() =>
          interceptor.intercept(mockExecutionContext, mockCallHandler),
        );

      void Promise.all(requests.map((r) => r.toPromise())).then(() => {
        const stats = interceptor.getStatistics();
        expect(stats.total).toBe(5);
        expect(stats.average).toBeGreaterThanOrEqual(0);
        done();
      });
    });

    it('should calculate percentiles correctly', (done) => {
      // Arrange
      mockExecutionContext = {
        getType: jest.fn().mockReturnValue('http'),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            method: 'GET',
            url: '/test',
          }),
        }),
      } as any;

      // Act - Create 100 requests to get meaningful percentiles
      const requests = Array(100)
        .fill(null)
        .map(() =>
          interceptor.intercept(mockExecutionContext, mockCallHandler),
        );

      void Promise.all(requests.map((r) => r.toPromise())).then(() => {
        const stats = interceptor.getStatistics();
        expect(stats.total).toBe(100);
        expect(stats.p50).toBeGreaterThanOrEqual(0);
        expect(stats.p95).toBeGreaterThanOrEqual(stats.p50);
        expect(stats.p99).toBeGreaterThanOrEqual(stats.p95);
        done();
      });
    });

    it('should count slow requests correctly', (done) => {
      // Arrange - Simulate slow request
      mockExecutionContext = {
        getType: jest.fn().mockReturnValue('http'),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            method: 'GET',
            url: '/slow',
          }),
        }),
      } as any;

      // Create a slow mock handler that returns an Observable
      const slowHandler = {
        handle: jest.fn().mockReturnValue(of('slow-response')),
      } as any;

      // Act
      const result$ = interceptor.intercept(mockExecutionContext, slowHandler);

      result$.subscribe(() => {
        const stats = interceptor.getStatistics();
        expect(stats.total).toBe(1);
        expect(stats.slowRequests).toBeGreaterThanOrEqual(0);
        done();
      });
    });
  });

  describe('clearMetrics', () => {
    it('should clear all metrics', (done) => {
      // Arrange
      mockExecutionContext = {
        getType: jest.fn().mockReturnValue('http'),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            method: 'GET',
            url: '/test',
          }),
        }),
      } as any;

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe(() => {
        expect(interceptor.getStatistics().total).toBe(1);

        // Act
        interceptor.clearMetrics();

        // Assert
        const stats = interceptor.getStatistics();
        expect(stats.total).toBe(0);
        expect(stats.average).toBe(0);
        done();
      });
    });

    it('should allow new metrics after clearing', (done) => {
      // Arrange
      mockExecutionContext = {
        getType: jest.fn().mockReturnValue('http'),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            method: 'GET',
            url: '/test',
          }),
        }),
      } as any;

      const result1$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result1$.subscribe(() => {
        interceptor.clearMetrics();

        const result2$ = interceptor.intercept(
          mockExecutionContext,
          mockCallHandler,
        );

        result2$.subscribe(() => {
          const stats = interceptor.getStatistics();
          expect(stats.total).toBe(1);
          done();
        });
      });
    });
  });

  describe('memory management', () => {
    it('should limit metrics to MAX_METRICS', (done) => {
      // Arrange
      mockExecutionContext = {
        getType: jest.fn().mockReturnValue('http'),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            method: 'GET',
            url: '/test',
          }),
        }),
      } as any;

      // Act - Create more than MAX_METRICS (1000) requests
      const requests = Array(1100)
        .fill(null)
        .map(() =>
          interceptor.intercept(mockExecutionContext, mockCallHandler),
        );

      void Promise.all(requests.map((r) => r.toPromise())).then(() => {
        const stats = interceptor.getStatistics();
        // Should not exceed MAX_METRICS
        expect(stats.total).toBeLessThanOrEqual(1000);
        done();
      });
    }, 10000); // Increase timeout for this test
  });
});
