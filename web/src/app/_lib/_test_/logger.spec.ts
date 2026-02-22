import { logger } from '../logger';
import * as Sentry from '@sentry/nextjs';
import { CONFIG } from '../../_constants/config';

// Mock Sentry
jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}));

// Mock CONFIG
jest.mock('../../_constants/config', () => ({
  CONFIG: {
    SENTRY: {
      ENABLED: true,
    },
  },
}));

describe('logger', () => {
  let consoleSpy: {
    log: jest.SpyInstance;
    info: jest.SpyInstance;
    error: jest.SpyInstance;
    warn: jest.SpyInstance;
  };
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    originalNodeEnv = process.env.NODE_ENV;

    // Console methods をモック
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      info: jest.spyOn(console, 'info').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
    };
  });

  afterEach(() => {
    // Restore environment
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalNodeEnv,
      writable: true,
      configurable: true,
    });

    // Restore console methods
    consoleSpy.log.mockRestore();
    consoleSpy.info.mockRestore();
    consoleSpy.error.mockRestore();
    consoleSpy.warn.mockRestore();
  });

  describe('development環境', () => {
    beforeEach(() => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true,
      });
    });

    describe('error', () => {
      it('エラーメッセージをコンソールに出力する', () => {
        logger.error('Test error', {
          component: 'TestComponent',
        });

        expect(consoleSpy.error).toHaveBeenCalled();
      });

      it('エラーコンテキストを含めて出力する', () => {
        const error = new Error('Test error');
        logger.error('Error occurred', {
          component: 'TestComponent',
          action: 'testAction',
          error,
        });

        expect(consoleSpy.error).toHaveBeenCalledWith(
          expect.stringContaining('[ERROR]'),
          'Error occurred',
          expect.objectContaining({
            error: {
              message: 'Test error',
              stack: expect.any(String),
            },
          })
        );
      });

      it('メタデータを含めて出力する', () => {
        logger.error('Error with meta', {
          component: 'TestComponent',
          meta: { key: 'value' },
        });

        expect(consoleSpy.error).toHaveBeenCalledWith(
          expect.anything(),
          'Error with meta',
          expect.objectContaining({
            meta: { key: 'value' },
          })
        );
      });

      it('userIdを含めて出力する', () => {
        logger.error('User error', {
          component: 'TestComponent',
          userId: 'user-123',
        });

        expect(consoleSpy.error).toHaveBeenCalled();
      });
    });

    describe('warn', () => {
      it('警告メッセージをコンソールに出力する', () => {
        logger.warn('Test warning', {
          component: 'TestComponent',
        });

        expect(consoleSpy.warn).toHaveBeenCalled();
      });

      it('アクションを含めて出力する', () => {
        logger.warn('Warning message', {
          component: 'TestComponent',
          action: 'testAction',
        });

        expect(consoleSpy.warn).toHaveBeenCalledWith(
          expect.stringContaining('[WARN]'),
          'Warning message',
          expect.any(Object)
        );
      });
    });

    describe('info', () => {
      it('情報メッセージをコンソールに出力する', () => {
        logger.info('Test info', {
          component: 'TestComponent',
        });

        expect(consoleSpy.info).toHaveBeenCalledWith(
          expect.stringContaining('[INFO]'),
          'Test info',
          expect.any(Object)
        );
      });
    });

    describe('debug', () => {
      it('デバッグメッセージをコンソールに出力する', () => {
        logger.debug('Test debug', {
          component: 'TestComponent',
        });

        expect(consoleSpy.log).toHaveBeenCalledWith(
          expect.stringContaining('[DEBUG]'),
          'Test debug',
          expect.any(Object)
        );
      });
    });
  });

  describe('production環境', () => {
    beforeEach(() => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      });
    });

    describe('error', () => {
      it('エラーを最小限でコンソールに出力する', () => {
        logger.error('Production error', {
          component: 'TestComponent',
        });

        expect(consoleSpy.error).toHaveBeenCalledWith(
          expect.stringContaining('[ERROR]'),
          'Production error',
          expect.objectContaining({
            timestamp: expect.any(String),
          })
        );
      });

      it('Sentryが有効な場合はエラーを送信する', () => {
        const error = new Error('Test error');
        logger.error('Sentry error', {
          component: 'TestComponent',
          action: 'testAction',
          error,
          userId: 'user-123',
          meta: { key: 'value' },
        });

        expect(Sentry.captureException).toHaveBeenCalledWith(error, {
          level: 'error',
          tags: {
            component: 'TestComponent',
            action: 'testAction',
          },
          user: { id: 'user-123' },
          extra: expect.objectContaining({
            message: 'Sentry error',
            timestamp: expect.any(String),
            key: 'value',
          }),
        });
      });

      it('Sentryが無効な場合はエラーを送信しない', () => {
        // CONFIG.SENTRY.ENABLEDを一時的にfalseに設定
        jest
          .mocked(CONFIG.SENTRY)
          .ENABLED = false as any; // eslint-disable-line @typescript-eslint/no-explicit-any

        const error = new Error('Test error');
        logger.error('Error without Sentry', {
          component: 'TestComponent',
          error,
        });

        // Sentryには送信されない
        expect(Sentry.captureException).not.toHaveBeenCalled();
        // コンソールには出力される
        expect(consoleSpy.error).toHaveBeenCalled();

        // Restore SENTRY.ENABLED
        jest
          .mocked(CONFIG.SENTRY)
          .ENABLED = true as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      });
    });

    describe('warn', () => {
      it('警告を簡潔にコンソールに出力する', () => {
        logger.warn('Production warning', {
          component: 'TestComponent',
        });

        expect(consoleSpy.warn).toHaveBeenCalledWith(
          '[WARN] TestComponent: Production warning'
        );
      });

      it('Sentryが有効な場合は警告を送信する', () => {
        logger.warn('Sentry warning', {
          component: 'TestComponent',
          action: 'testAction',
          meta: { key: 'value' },
        });

        expect(Sentry.captureMessage).toHaveBeenCalledWith(
          'Sentry warning',
          {
            level: 'warning',
            tags: {
              component: 'TestComponent',
              action: 'testAction',
            },
            extra: { key: 'value' },
          }
        );
      });
    });

    describe('info', () => {
      it('本番環境ではinfoログを出力しない', () => {
        logger.info('Production info', {
          component: 'TestComponent',
        });

        expect(consoleSpy.log).not.toHaveBeenCalled();
        expect(consoleSpy.info).not.toHaveBeenCalled();
      });
    });

    describe('debug', () => {
      it('本番環境ではdebugログを出力しない', () => {
        logger.debug('Production debug', {
          component: 'TestComponent',
        });

        expect(consoleSpy.log).not.toHaveBeenCalled();
      });
    });
  });

  describe('エラーフォーマット', () => {
    beforeEach(() => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true,
      });
    });

    it('Error型をフォーマットする', () => {
      const error = new Error('Test error message');
      logger.error('Error formatting', {
        component: 'TestComponent',
        error,
      });

      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.anything(),
        'Error formatting',
        expect.objectContaining({
          error: {
            message: 'Test error message',
            stack: expect.any(String),
          },
        })
      );
    });

    it('非Error型をフォーマットする', () => {
      logger.error('Non-error object', {
        component: 'TestComponent',
        error: 'Simple string error',
      });

      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.anything(),
        'Non-error object',
        expect.objectContaining({
          error: {
            message: 'Simple string error',
          },
        })
      );
    });

    it('数値エラーをフォーマットする', () => {
      logger.error('Number error', {
        component: 'TestComponent',
        error: 404,
      });

      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.anything(),
        'Number error',
        expect.objectContaining({
          error: {
            message: '404',
          },
        })
      );
    });
  });
});
