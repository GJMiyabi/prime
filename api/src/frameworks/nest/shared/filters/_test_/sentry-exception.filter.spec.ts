import { SentryExceptionFilter } from '../sentry-exception.filter';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import * as Sentry from '@sentry/nestjs';

// Sentryをモック
jest.mock('@sentry/nestjs', () => ({
  captureException: jest.fn(),
  setUser: jest.fn(),
  setContext: jest.fn(),
}));

describe('SentryExceptionFilter', () => {
  let filter: SentryExceptionFilter;
  let mockArgumentsHost: jest.Mocked<ArgumentsHost>;

  beforeEach(() => {
    filter = new SentryExceptionFilter();
    jest.clearAllMocks();
  });

  describe('HTTP exceptions', () => {
    let mockResponse: any;
    let mockRequest: any;

    beforeEach(() => {
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      mockRequest = {
        method: 'GET',
        url: '/api/test',
        headers: {
          'user-agent': 'test-agent',
        },
      };

      mockArgumentsHost = {
        getType: jest.fn().mockReturnValue('http'),
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: jest.fn().mockReturnValue(mockResponse),
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
      } as any;
    });

    it('should handle HTTP exception', () => {
      // Arrange
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 400,
        message: 'Test error',
        timestamp: expect.any(String),
        path: '/api/test',
      });
      expect(Sentry.captureException).toHaveBeenCalled();
    });

    it('should handle 500 internal server error', () => {
      // Arrange
      const exception = new HttpException(
        'Internal error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(Sentry.captureException).toHaveBeenCalledWith(
        exception,
        expect.objectContaining({
          level: 'error',
        }),
      );
    });

    it('should handle 404 not found', () => {
      // Arrange
      const exception = new HttpException('Not found', HttpStatus.NOT_FOUND);

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(Sentry.captureException).toHaveBeenCalledWith(
        exception,
        expect.objectContaining({
          level: 'warning',
        }),
      );
    });

    it('should capture user context when user is authenticated', () => {
      // Arrange
      mockRequest.user = {
        userId: 'user-123',
        role: 'ADMIN',
      };
      const exception = new HttpException('Error', HttpStatus.BAD_REQUEST);

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'user-123',
        role: 'ADMIN',
      });
    });

    it('should set HTTP context in Sentry', () => {
      // Arrange
      const exception = new HttpException('Error', HttpStatus.BAD_REQUEST);

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(Sentry.setContext).toHaveBeenCalledWith(
        'http',
        expect.objectContaining({
          method: 'GET',
          url: '/api/test',
          statusCode: 400,
          userAgent: 'test-agent',
        }),
      );
    });

    it('should handle non-HTTP exceptions', () => {
      // Arrange
      const exception = new Error('Generic error');

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 500,
        message: 'Generic error',
        timestamp: expect.any(String),
        path: '/api/test',
      });
    });
  });

  describe('GraphQL exceptions', () => {
    let mockContext: any;
    let mockInfo: any;

    beforeEach(() => {
      mockContext = {
        req: {
          user: null,
        },
        res: {},
      };

      mockInfo = {
        operation: {
          name: { value: 'GetUser' },
          operation: 'query',
        },
        fieldName: 'user',
        parentType: { name: 'Query' },
      };

      const mockGqlContext = {
        getContext: jest.fn().mockReturnValue(mockContext),
        getInfo: jest.fn().mockReturnValue(mockInfo),
      };

      mockArgumentsHost = {
        getType: jest.fn().mockReturnValue('graphql'),
      } as any;

      jest
        .spyOn(GqlArgumentsHost, 'create')
        .mockReturnValue(mockGqlContext as any);
    });

    it('should handle GraphQL exception', () => {
      // Arrange
      const exception = new GraphQLError('GraphQL error');

      // Act & Assert
      expect(() => {
        filter.catch(exception, mockArgumentsHost);
      }).toThrow(exception);

      expect(Sentry.captureException).toHaveBeenCalled();
    });

    it('should set GraphQL context in Sentry', () => {
      // Arrange
      const exception = new GraphQLError('Query error');

      // Act
      try {
        filter.catch(exception, mockArgumentsHost);
      } catch {
        // Expected to throw
      }

      // Assert
      expect(Sentry.setContext).toHaveBeenCalledWith(
        'graphql',
        expect.objectContaining({
          operationName: 'GetUser',
          operationType: 'query',
          fieldName: 'user',
          parentType: 'Query',
        }),
      );
    });

    it('should set user context for authenticated GraphQL requests', () => {
      // Arrange
      mockContext.req.user = {
        userId: 'user-456',
        role: 'TEACHER',
      };
      const exception = new GraphQLError('Auth error');

      // Act
      try {
        filter.catch(exception, mockArgumentsHost);
      } catch {
        // Expected to throw
      }

      // Assert
      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'user-456',
        role: 'TEACHER',
      });
    });

    it('should handle GraphQL errors without operation name', () => {
      // Arrange
      mockInfo.operation.name = undefined;
      const exception = new GraphQLError('Error');

      // Act
      try {
        filter.catch(exception, mockArgumentsHost);
      } catch {
        // Expected to throw
      }

      // Assert
      expect(Sentry.setContext).toHaveBeenCalledWith(
        'graphql',
        expect.objectContaining({
          operationName: 'unknown',
        }),
      );
    });

    it('should re-throw GraphQL errors for Apollo Server', () => {
      // Arrange
      const exception = new GraphQLError('Must re-throw');

      // Act & Assert
      expect(() => {
        filter.catch(exception, mockArgumentsHost);
      }).toThrow(exception);
    });

    it('should capture originalError from GraphQLError', () => {
      // Arrange
      const originalError = new Error('Original error');
      const exception = new GraphQLError('Wrapped error', {
        originalError,
      } as any);

      // Act
      try {
        filter.catch(exception, mockArgumentsHost);
      } catch {
        // Expected to throw
      }

      // Assert
      expect(Sentry.captureException).toHaveBeenCalledWith(
        originalError,
        expect.objectContaining({
          tags: expect.objectContaining({
            graphql_error: true,
          }),
        }),
      );
    });
  });

  describe('sendToSentry', () => {
    beforeEach(() => {
      // Setup basic HTTP context for these tests
      mockArgumentsHost = {
        getType: jest.fn().mockReturnValue('http'),
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: jest.fn().mockReturnValue({
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
          }),
          getRequest: jest.fn().mockReturnValue({
            method: 'GET',
            url: '/test',
            headers: {},
          }),
        }),
      } as any;
    });

    it('should send 5xx errors as error level', () => {
      // Arrange
      const exception = new HttpException('Server error', 500);

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(Sentry.captureException).toHaveBeenCalledWith(
        exception,
        expect.objectContaining({
          level: 'error',
        }),
      );
    });

    it('should send 4xx errors as warning level', () => {
      // Arrange
      const exception = new HttpException('Bad request', 400);

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(Sentry.captureException).toHaveBeenCalledWith(
        exception,
        expect.objectContaining({
          level: 'warning',
        }),
      );
    });

    it('should send generic errors as error level', () => {
      // Arrange
      const exception = new Error('Unknown error');

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(Sentry.captureException).toHaveBeenCalledWith(
        exception,
        expect.objectContaining({
          level: 'error',
        }),
      );
    });

    it('should include HTTP status tag', () => {
      // Arrange
      const exception = new HttpException('Error', 403);

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(Sentry.captureException).toHaveBeenCalledWith(
        exception,
        expect.objectContaining({
          tags: expect.objectContaining({
            http_status: 403,
          }),
        }),
      );
    });

    it('should include type tag', () => {
      // Arrange
      const exception = new HttpException('Error', 500);

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(Sentry.captureException).toHaveBeenCalledWith(
        exception,
        expect.objectContaining({
          tags: expect.objectContaining({
            type: 'http',
          }),
        }),
      );
    });
  });
});
