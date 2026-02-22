import {
  sanitizeInput,
  sanitizeObject,
  sanitizeHtml,
  sanitizeUrl,
} from '../sanitize';
import * as logger from '../logger';
import DOMPurify from 'dompurify';

// Mock logger
jest.mock('../logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock DOMPurify
jest.mock('dompurify', () => ({
  sanitize: jest.fn((input: string) => input),
  __esModule: true,
  default: {
    sanitize: jest.fn((input: string) => input),
  },
}));

describe('sanitize', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sanitizeInput', () => {
    it('空文字列の場合はそのまま返す', () => {
      const result = sanitizeInput('');

      expect(result).toBe('');
    });

    it('DOMPurify.sanitizeを呼び出す', () => {
      const input = 'test input';
      sanitizeInput(input);

      expect(DOMPurify.sanitize).toHaveBeenCalledWith(input, expect.any(Object));
    });

    it('サニタイズされた文字列を返す', () => {
      const input = '<script>alert("XSS")</script>Hello';
      jest.mocked(DOMPurify.sanitize).mockReturnValue('Hello');

      const result = sanitizeInput(input);

      expect(result).toBe('Hello');
    });

    it('サニタイズで変更があった場合はlogger.warnを呼び出す', () => {
      const input = '<script>alert("XSS")</script>Hello';
      jest.mocked(DOMPurify.sanitize).mockReturnValue('Hello');

      sanitizeInput(input);

      expect(logger.logger.warn).toHaveBeenCalledWith(
        '入力がサニタイズされました',
        expect.objectContaining({
          component: 'sanitize.ts',
          action: 'sanitizeInput',
        })
      );
    });

    it('サニタイズで変更がなかった場合はlogger.warnを呼び出さない', () => {
      const input = 'Hello';
      jest.mocked(DOMPurify.sanitize).mockReturnValue('Hello');

      sanitizeInput(input);

      expect(logger.logger.warn).not.toHaveBeenCalled();
    });

    it('カスタム設定を受け入れる', () => {
      const input = '<b>Hello</b>';
      const config = {
        ALLOWED_TAGS: ['b'],
        ALLOWED_ATTR: [],
        KEEP_CONTENT: true,
      };

      sanitizeInput(input, config);

      expect(DOMPurify.sanitize).toHaveBeenCalledWith(input, config);
    });
  });

  describe('sanitizeObject', () => {
    it('文字列フィールドをサニタイズする', () => {
      const input = {
        name: '<script>alert("XSS")</script>John',
        email: 'john@example.com',
      };
      jest
        .mocked(DOMPurify.sanitize)
        .mockImplementation((str: string | Node) => {
          if (typeof str === 'string') {
            return str.replace(/<script>.*?<\/script>/g, '');
          }
          return str as unknown as string;
        });

      const result = sanitizeObject(input);

      expect(DOMPurify.sanitize).toHaveBeenCalled();
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('email');
    });

    it('数値フィールドはそのまま保持する', () => {
      const input = {
        name: 'John',
        age: 30,
      };
      jest.mocked(DOMPurify.sanitize).mockImplementation((str: string | Node) => {
        if (typeof str === 'string') {
          return str;
        }
        return str as unknown as string;
      });

      const result = sanitizeObject(input);

      expect(result.age).toBe(30);
    });

    it('配列内の文字列をサニタイズする', () => {
      const input = {
        tags: ['<script>test</script>', 'safe'],
      };
      jest
        .mocked(DOMPurify.sanitize)
        .mockImplementation((str: string | Node) => {
          if (typeof str === 'string') {
            return str.replace(/<script>.*?<\/script>/g, '');
          }
          return str as unknown as string;
        });

      const result = sanitizeObject(input);

      expect(DOMPurify.sanitize).toHaveBeenCalled();
      expect(result.tags).toHaveLength(2);
    });

    it('ネストされたオブジェクトをサニタイズする', () => {
      const input = {
        user: {
          name: '<script>John</script>',
        },
      };
      jest
        .mocked(DOMPurify.sanitize)
        .mockImplementation((str: string | Node) => {
          if (typeof str === 'string') {
            return str.replace(/<script>.*?<\/script>/g, '');
          }
          return str as unknown as string;
        });

      const result = sanitizeObject(input);

      expect(DOMPurify.sanitize).toHaveBeenCalled();
      expect(result.user).toHaveProperty('name');
    });

    it('配列内のオブジェクトをサニタイズする', () => {
      const input = {
        users: [
          { name: '<script>John</script>' },
          { name: 'Jane' },
        ],
      };
      jest
        .mocked(DOMPurify.sanitize)
        .mockImplementation((str: string | Node) => {
          if (typeof str === 'string') {
            return str.replace(/<script>.*?<\/script>/g, '');
          }
          return str as unknown as string;
        });

      const result = sanitizeObject(input);

      expect(DOMPurify.sanitize).toHaveBeenCalled();
      expect(result.users).toHaveLength(2);
    });
  });

  describe('sanitizeHtml', () => {
    it('安全なHTMLタグは保持する', () => {
      const html = '<p>Hello</p>';
      jest.mocked(DOMPurify.sanitize).mockReturnValue('<p>Hello</p>');

      const result = sanitizeHtml(html);

      expect(result).toBe('<p>Hello</p>');
    });

    it('危険なHTMLタグは除去する', () => {
      const html = '<p>Hello <script>alert("XSS")</script></p>';
      jest.mocked(DOMPurify.sanitize).mockReturnValue('<p>Hello </p>');

      const result = sanitizeHtml(html);

      expect(result).toBe('<p>Hello </p>');
    });

    it('DOMPurify.sanitizeを適切な設定で呼び出す', () => {
      const html = '<b>Bold</b>';
      sanitizeHtml(html);

      expect(DOMPurify.sanitize).toHaveBeenCalledWith(html, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'span'],
        ALLOWED_ATTR: ['class'],
        KEEP_CONTENT: true,
      });
    });
  });

  describe('sanitizeUrl', () => {
    it('空文字列の場合は空文字列を返す', () => {
      const result = sanitizeUrl('');

      expect(result).toBe('');
    });

    it('安全なHTTPS URLはそのまま返す', () => {
      const url = 'https://example.com';

      const result = sanitizeUrl(url);

      expect(result).toBe('https://example.com');
    });

    it('安全なHTTP URLはそのまま返す', () => {
      const url = 'http://example.com';

      const result = sanitizeUrl(url);

      expect(result).toBe('http://example.com');
    });

    it('相対URLはそのまま返す', () => {
      const url = '/path/to/page';

      const result = sanitizeUrl(url);

      expect(result).toBe('/path/to/page');
    });

    it('javascript:プロトコルの場合は空文字列を返す', () => {
      const url = 'javascript:alert("XSS")';

      const result = sanitizeUrl(url);

      expect(result).toBe('');
    });

    it('data:プロトコルの場合は空文字列を返す', () => {
      const url = 'data:text/html,<script>alert("XSS")</script>';

      const result = sanitizeUrl(url);

      expect(result).toBe('');
    });

    it('vbscript:プロトコルの場合は空文字列を返す', () => {
      const url = 'vbscript:msgbox("XSS")';

      const result = sanitizeUrl(url);

      expect(result).toBe('');
    });

    it('大文字小文字が混在する危険なプロトコルも検出する', () => {
      const url = 'JaVaScRiPt:alert("XSS")';

      const result = sanitizeUrl(url);

      expect(result).toBe('');
    });

    it('危険なURLが検出された場合はlogger.warnを呼び出す', () => {
      const url = 'javascript:alert("XSS")';

      sanitizeUrl(url);

      expect(logger.logger.warn).toHaveBeenCalledWith(
        '危険なURLが検出されました',
        expect.objectContaining({
          component: 'sanitize.ts',
          action: 'sanitizeUrl',
          meta: { url },
        })
      );
    });
  });
});
