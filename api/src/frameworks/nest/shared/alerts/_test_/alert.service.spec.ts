import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AlertService, AlertLevel } from '../alert.service';

describe('AlertService', () => {
  let service: AlertService;
  let originalEnv: NodeJS.ProcessEnv;
  let mockPost: jest.Mock;

  beforeAll(() => {
    // モック関数を一度だけ作成
    mockPost = jest.fn();
  });

  beforeEach(async () => {
    // 環境変数を保存
    originalEnv = { ...process.env };

    // Production環境に設定
    process.env.NODE_ENV = 'production';
    process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/test';

    // モックのコール履歴をクリアし、デフォルトの振る舞いを設定
    mockPost.mockClear();
    mockPost.mockReturnValue(of({ data: 'ok' }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertService,
        {
          provide: HttpService,
          useValue: {
            post: mockPost,
          },
        },
      ],
    }).compile();

    service = module.get<AlertService>(AlertService);

    // アラートキャッシュをクリア
    service.clearCache();
  });

  afterEach(() => {
    // 環境変数を復元
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should be disabled in development mode', () => {
      // Arrange
      process.env.NODE_ENV = 'development';
      delete process.env.SLACK_WEBHOOK_URL;

      // Act
      const testModule = Test.createTestingModule({
        providers: [
          AlertService,
          {
            provide: HttpService,
            useValue: { post: jest.fn() },
          },
        ],
      });

      // Assert
      expect(testModule).toBeDefined();
    });

    it('should be disabled without SLACK_WEBHOOK_URL', () => {
      // Arrange
      process.env.NODE_ENV = 'production';
      delete process.env.SLACK_WEBHOOK_URL;

      // Act
      const testModule = Test.createTestingModule({
        providers: [
          AlertService,
          {
            provide: HttpService,
            useValue: { post: jest.fn() },
          },
        ],
      });

      // Assert
      expect(testModule).toBeDefined();
    });

    it('should be enabled in production with SLACK_WEBHOOK_URL', () => {
      // Arrange
      process.env.NODE_ENV = 'production';
      process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/test';

      // Act
      const testModule = Test.createTestingModule({
        providers: [
          AlertService,
          {
            provide: HttpService,
            useValue: { post: jest.fn() },
          },
        ],
      });

      // Assert
      expect(testModule).toBeDefined();
    });
  });

  describe('sendAlert', () => {
    it('should send alert to Slack in production', async () => {
      // Arrange
      const alert = {
        level: AlertLevel.ERROR,
        title: 'Test Alert',
        message: 'Test message',
      };

      // Act
      await service.sendAlert(alert);

      // Assert
      expect(mockPost).toHaveBeenCalledWith(
        'https://hooks.slack.com/services/test',
        expect.objectContaining({
          text: expect.stringContaining('Test Alert'),
          attachments: expect.arrayContaining([
            expect.objectContaining({
              title: 'Test Alert',
              text: 'Test message',
            }),
          ]),
        }),
      );
    });

    it('should include metadata in Slack message', async () => {
      // Arrange
      const alert = {
        level: AlertLevel.WARNING,
        title: 'Test Alert',
        message: 'Test message',
        metadata: {
          userId: '123',
          action: 'test',
        },
      };

      // Act
      await service.sendAlert(alert);

      // Assert
      expect(mockPost).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          attachments: expect.arrayContaining([
            expect.objectContaining({
              fields: expect.arrayContaining([
                { title: 'userId', value: '123', short: true },
                { title: 'action', value: 'test', short: true },
              ]),
            }),
          ]),
        }),
      );
    });

    it('should throttle duplicate alerts within cooldown period', async () => {
      // Arrange
      const alert = {
        level: AlertLevel.ERROR,
        title: 'Same Alert',
        message: 'Test message',
      };

      // Act
      await service.sendAlert(alert);
      await service.sendAlert(alert); // Should be throttled

      // Assert
      expect(mockPost).toHaveBeenCalledTimes(1);
    });

    it('should send same alert after cooldown period', async () => {
      // Arrange
      const alert = {
        level: AlertLevel.ERROR,
        title: 'Same Alert',
        message: 'Test message',
      };

      // Act
      await service.sendAlert(alert);
      service.clearCache(); // Simulate cooldown by clearing cache
      await service.sendAlert(alert);

      // Assert
      expect(mockPost).toHaveBeenCalledTimes(2);
    });

    it('should handle Slack API errors gracefully', async () => {
      // Arrange
      mockPost.mockReturnValue(throwError(() => new Error('Slack API error')));

      const alert = {
        level: AlertLevel.ERROR,
        title: 'Test Alert',
        message: 'Test message',
      };

      // Act & Assert - should not throw
      await expect(service.sendAlert(alert)).resolves.not.toThrow();
    });

    it('should not send to Slack in development mode', async () => {
      // Arrange
      process.env.NODE_ENV = 'development';

      // Re-create service for development
      const devModule = await Test.createTestingModule({
        providers: [
          AlertService,
          {
            provide: HttpService,
            useValue: { post: mockPost },
          },
        ],
      }).compile();

      const devService = devModule.get<AlertService>(AlertService);

      const alert = {
        level: AlertLevel.ERROR,
        title: 'Test Alert',
        message: 'Test message',
      };

      // Act
      await devService.sendAlert(alert);

      // Assert
      expect(mockPost).not.toHaveBeenCalled();
    });
  });

  describe('sendErrorRateAlert', () => {
    it('should send error rate alert with correct data', async () => {
      // Arrange

      // Act
      await service.sendErrorRateAlert(15.5, 10);

      // Assert
      expect(mockPost).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          text: expect.stringContaining('High Error Rate'),
          attachments: expect.arrayContaining([
            expect.objectContaining({
              title: '🚨 High Error Rate Detected',
              text: 'Error rate is 15.50% (threshold: 10%)',
            }),
          ]),
        }),
      );
    });

    it('should include metadata with error rate and threshold', async () => {
      // Arrange

      // Act
      await service.sendErrorRateAlert(25.75, 20);

      // Assert
      expect(mockPost).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          attachments: expect.arrayContaining([
            expect.objectContaining({
              fields: expect.arrayContaining([
                { title: 'errorRate', value: '25.75', short: true },
                { title: 'threshold', value: '20', short: true },
              ]),
            }),
          ]),
        }),
      );
    });
  });

  describe('sendSlowResponseAlert', () => {
    it('should send slow response alert with correct data', async () => {
      // Arrange

      // Act
      await service.sendSlowResponseAlert(5000, 3000, {
        type: 'Query',
        name: 'getUsers',
      });

      // Assert
      expect(mockPost).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          text: expect.stringContaining('Slow Response'),
          attachments: expect.arrayContaining([
            expect.objectContaining({
              title: '⏱️ Slow Response Detected',
              text: 'Query getUsers took 5000ms (threshold: 3000ms)',
            }),
          ]),
        }),
      );
    });

    it('should include type and name in metadata', async () => {
      // Arrange

      // Act
      await service.sendSlowResponseAlert(8000, 5000, {
        type: 'Mutation',
        name: 'createUser',
      });

      // Assert
      expect(mockPost).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          attachments: expect.arrayContaining([
            expect.objectContaining({
              fields: expect.arrayContaining([
                { title: 'type', value: 'Mutation', short: true },
                { title: 'name', value: 'createUser', short: true },
              ]),
            }),
          ]),
        }),
      );
    });
  });

  describe('sendDatabaseErrorAlert', () => {
    it('should send database error alert with error message', async () => {
      // Arrange
      const error = new Error('Connection timeout');

      // Act
      await service.sendDatabaseErrorAlert(error);

      // Assert
      expect(mockPost).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          text: expect.stringContaining('Database Connection Error'),
          attachments: expect.arrayContaining([
            expect.objectContaining({
              title: '💥 Database Connection Error',
              text: 'Database error: Connection timeout',
            }),
          ]),
        }),
      );
    });

    it('should use CRITICAL level', async () => {
      // Arrange
      const error = new Error('Test error');

      // Act
      await service.sendDatabaseErrorAlert(error);

      // Assert
      expect(mockPost).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          attachments: expect.arrayContaining([
            expect.objectContaining({
              color: '#FF0000', // Critical color
            }),
          ]),
        }),
      );
    });
  });

  describe('sendMemoryAlert', () => {
    it('should send memory alert with usage percentage', async () => {
      // Arrange

      // Act
      await service.sendMemoryAlert(85.5, 80);

      // Assert
      expect(mockPost).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          text: expect.stringContaining('High Memory Usage'),
          attachments: expect.arrayContaining([
            expect.objectContaining({
              title: '💾 High Memory Usage',
              text: 'Memory usage is 85.5% (threshold: 80%)',
            }),
          ]),
        }),
      );
    });

    it('should include metadata with usage and threshold', async () => {
      // Arrange

      // Act
      await service.sendMemoryAlert(92.3, 90);

      // Assert
      expect(mockPost).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          attachments: expect.arrayContaining([
            expect.objectContaining({
              fields: expect.arrayContaining([
                { title: 'usagePercent', value: '92.3', short: true },
                { title: 'threshold', value: '90', short: true },
              ]),
            }),
          ]),
        }),
      );
    });
  });

  describe('Alert colors and emojis', () => {
    it('should use red color for CRITICAL level', async () => {
      // Arrange

      // Act
      await service.sendAlert({
        level: AlertLevel.CRITICAL,
        title: 'Critical',
        message: 'Critical message',
      });

      // Assert
      expect(mockPost).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          text: '🔴 *Critical*',
          attachments: expect.arrayContaining([
            expect.objectContaining({
              color: '#FF0000',
            }),
          ]),
        }),
      );
    });

    it('should use light red color for ERROR level', async () => {
      // Arrange

      // Act
      await service.sendAlert({
        level: AlertLevel.ERROR,
        title: 'Error',
        message: 'Error message',
      });

      // Assert
      expect(mockPost).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          text: '🚨 *Error*',
          attachments: expect.arrayContaining([
            expect.objectContaining({
              color: '#FF6B6B',
            }),
          ]),
        }),
      );
    });

    it('should use orange color for WARNING level', async () => {
      // Arrange

      // Act
      await service.sendAlert({
        level: AlertLevel.WARNING,
        title: 'Warning',
        message: 'Warning message',
      });

      // Assert
      expect(mockPost).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          text: '⚠️ *Warning*',
          attachments: expect.arrayContaining([
            expect.objectContaining({
              color: '#FFA500',
            }),
          ]),
        }),
      );
    });

    it('should use green color for INFO level', async () => {
      // Arrange

      // Act
      await service.sendAlert({
        level: AlertLevel.INFO,
        title: 'Info',
        message: 'Info message',
      });

      // Assert
      expect(mockPost).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          text: 'ℹ️ *Info*',
          attachments: expect.arrayContaining([
            expect.objectContaining({
              color: '#36A64F',
            }),
          ]),
        }),
      );
    });
  });

  describe('clearCache', () => {
    it('should clear alert cache', async () => {
      // Arrange
      process.env.NODE_ENV = 'production';
      process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/test';

      const alert = {
        level: AlertLevel.ERROR,
        title: 'Test',
        message: 'Test message',
      };

      // Act
      await service.sendAlert(alert);
      await service.sendAlert(alert); // Should be throttled
      expect(mockPost).toHaveBeenCalledTimes(1);

      service.clearCache();
      await service.sendAlert(alert); // Should be sent after cache clear

      // Assert
      expect(mockPost).toHaveBeenCalledTimes(2);
    });
  });
});
