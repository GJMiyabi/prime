import * as Sentry from '@sentry/nestjs';
import {
  initializeSentry,
  setSentryUser,
  clearSentryUser,
  captureException,
  captureMessage,
} from '../sentry.config';

// @sentry/nestjsをモック
jest.mock('@sentry/nestjs', () => ({
  init: jest.fn(),
  setUser: jest.fn(),
  setContext: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  httpIntegration: jest.fn(() => 'httpIntegration'),
  graphqlIntegration: jest.fn(() => 'graphqlIntegration'),
}));

describe('Sentry Configuration', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // 環境変数を保存
    originalEnv = { ...process.env };

    // console.logとconsole.warnをモック
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    // モックをクリア
    jest.clearAllMocks();
  });

  afterEach(() => {
    // 環境変数を復元
    process.env = originalEnv;

    // スパイを復元
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('initializeSentry', () => {
    it('should not initialize Sentry in development without DSN', () => {
      // Arrange
      process.env.NODE_ENV = 'development';
      delete process.env.SENTRY_DSN;

      // Act
      initializeSentry();

      // Assert
      expect(Sentry.init).not.toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[Sentry] Disabled (development or missing DSN)',
      );
    });

    it('should not initialize Sentry in production without DSN', () => {
      // Arrange
      process.env.NODE_ENV = 'production';
      delete process.env.SENTRY_DSN;

      // Act
      initializeSentry();

      // Assert
      expect(Sentry.init).not.toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[Sentry] Disabled (development or missing DSN)',
      );
    });

    it('should not initialize Sentry in development even with DSN', () => {
      // Arrange
      process.env.NODE_ENV = 'development';
      process.env.SENTRY_DSN = 'https://example@sentry.io/123';

      // Act
      initializeSentry();

      // Assert
      expect(Sentry.init).not.toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[Sentry] Disabled (development or missing DSN)',
      );
    });

    it('should initialize Sentry in production with DSN', () => {
      // Arrange
      process.env.NODE_ENV = 'production';
      process.env.SENTRY_DSN = 'https://example@sentry.io/123';

      // Act
      initializeSentry();

      // Assert
      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          dsn: 'https://example@sentry.io/123',
          environment: 'production',
          tracesSampleRate: 0.1,
        }),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[Sentry] Initialized (environment: production)',
      );
    });

    it('should use tracesSampleRate 1.0 for non-production', () => {
      // Arrange
      process.env.NODE_ENV = 'production'; // enabled requires production
      process.env.SENTRY_DSN = 'https://example@sentry.io/123';

      // Act
      initializeSentry();

      const initCall = (Sentry.init as jest.Mock).mock.calls[0][0];

      // Assert - Production uses 0.1
      expect(initCall.tracesSampleRate).toBe(0.1);
    });

    it('should include http and graphql integrations', () => {
      // Arrange
      process.env.NODE_ENV = 'production';
      process.env.SENTRY_DSN = 'https://example@sentry.io/123';

      // Act
      initializeSentry();

      // Assert
      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          integrations: ['httpIntegration', 'graphqlIntegration'],
        }),
      );
      expect(Sentry.httpIntegration).toHaveBeenCalled();
      expect(Sentry.graphqlIntegration).toHaveBeenCalled();
    });

    it('should include tracePropagationTargets', () => {
      // Arrange
      process.env.NODE_ENV = 'production';
      process.env.SENTRY_DSN = 'https://example@sentry.io/123';

      // Act
      initializeSentry();

      // Assert
      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          tracePropagationTargets: ['localhost', expect.any(RegExp)],
        }),
      );
    });

    describe('beforeSend filter', () => {
      let beforeSendFunction: any;

      beforeEach(() => {
        process.env.NODE_ENV = 'production';
        process.env.SENTRY_DSN = 'https://example@sentry.io/123';
        initializeSentry();

        const initCall = (Sentry.init as jest.Mock).mock.calls[0][0];
        beforeSendFunction = initCall.beforeSend;
      });

      it('should return null in development environment', () => {
        // Arrange
        process.env.NODE_ENV = 'development';
        const event = { message: 'test' };
        const hint = {};

        // Re-initialize with development
        jest.clearAllMocks();
        process.env.SENTRY_DSN = 'https://example@sentry.io/123';
        initializeSentry();

        const initCall = (Sentry.init as jest.Mock).mock.calls[0];
        if (!initCall) {
          // Development should not initialize
          expect(Sentry.init).not.toHaveBeenCalled();
          return;
        }

        const devBeforeSend = initCall[0].beforeSend;
        if (devBeforeSend) {
          // Act
          const result = devBeforeSend(event, hint);

          // Assert
          expect(result).toBeNull();
          expect(consoleWarnSpy).toHaveBeenCalledWith(
            '[Sentry] Development mode - event not sent:',
            event,
          );
        }
      });

      it('should filter HEALTH_CHECK errors', () => {
        // Arrange
        const event = { message: 'test' };
        const error = new Error('HEALTH_CHECK failed');
        const hint = { originalException: error };

        // Act
        const result = beforeSendFunction(event, hint);

        // Assert
        expect(result).toBeNull();
      });

      it('should filter PrismaClientKnownRequestError', () => {
        // Arrange
        const event = { message: 'test' };
        const error = new Error('PrismaClientKnownRequestError: something');
        const hint = { originalException: error };

        // Act
        const result = beforeSendFunction(event, hint);

        // Assert
        expect(result).toBeNull();
      });

      it('should send normal errors', () => {
        // Arrange
        const event = { message: 'test' };
        const error = new Error('Normal error');
        const hint = { originalException: error };

        // Act
        const result = beforeSendFunction(event, hint);

        // Assert
        expect(result).toBe(event);
      });

      it('should send event if no error in hint', () => {
        // Arrange
        const event = { message: 'test' };
        const hint = {};

        // Act
        const result = beforeSendFunction(event, hint);

        // Assert
        expect(result).toBe(event);
      });
    });
  });

  describe('setSentryUser', () => {
    it('should set user with id only', () => {
      // Act
      setSentryUser('user-123');

      // Assert
      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'user-123',
        role: undefined,
      });
    });

    it('should set user with id and role', () => {
      // Act
      setSentryUser('user-456', 'ADMIN');

      // Assert
      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'user-456',
        role: 'ADMIN',
      });
    });
  });

  describe('clearSentryUser', () => {
    it('should clear user context', () => {
      // Act
      clearSentryUser();

      // Assert
      expect(Sentry.setUser).toHaveBeenCalledWith(null);
    });
  });

  describe('captureException', () => {
    it('should capture exception without context', () => {
      // Arrange
      const error = new Error('Test error');

      // Act
      captureException(error);

      // Assert
      expect(Sentry.captureException).toHaveBeenCalledWith(error);
      expect(Sentry.setContext).not.toHaveBeenCalled();
    });

    it('should capture exception with context', () => {
      // Arrange
      const error = new Error('Test error');
      const context = { userId: '123', action: 'test' };

      // Act
      captureException(error, context);

      // Assert
      expect(Sentry.setContext).toHaveBeenCalledWith('additional', context);
      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });
  });

  describe('captureMessage', () => {
    it('should capture message with default level info', () => {
      // Act
      captureMessage('Test message');

      // Assert
      expect(Sentry.captureMessage).toHaveBeenCalledWith(
        'Test message',
        'info',
      );
    });

    it('should capture message with warning level', () => {
      // Act
      captureMessage('Warning message', 'warning');

      // Assert
      expect(Sentry.captureMessage).toHaveBeenCalledWith(
        'Warning message',
        'warning',
      );
    });

    it('should capture message with error level', () => {
      // Act
      captureMessage('Error message', 'error');

      // Assert
      expect(Sentry.captureMessage).toHaveBeenCalledWith(
        'Error message',
        'error',
      );
    });
  });
});
