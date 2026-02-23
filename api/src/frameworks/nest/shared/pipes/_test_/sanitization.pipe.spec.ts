import { SanitizationPipe } from '../sanitization.pipe';

describe('SanitizationPipe', () => {
  let pipe: SanitizationPipe;

  beforeEach(() => {
    pipe = new SanitizationPipe();
  });

  describe('primitive types', () => {
    it('should return null as is', () => {
      // Act
      const result = pipe.transform(null);

      // Assert
      expect(result).toBeNull();
    });

    it('should return undefined as is', () => {
      // Act
      const result = pipe.transform(undefined);

      // Assert
      expect(result).toBeUndefined();
    });

    it('should sanitize string values', () => {
      // Arrange
      const input = '<script>alert("XSS")</script>';

      // Act
      const result = pipe.transform(input);

      // Assert
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('</script>');
      expect(typeof result).toBe('string');
    });

    it('should return numbers as is', () => {
      // Act
      const result = pipe.transform(123);

      // Assert
      expect(result).toBe(123);
    });

    it('should return booleans as is', () => {
      // Act
      const result1 = pipe.transform(true);
      const result2 = pipe.transform(false);

      // Assert
      expect(result1).toBe(true);
      expect(result2).toBe(false);
    });
  });

  describe('XSS protection - script tags', () => {
    it('should remove <script> tags', () => {
      // Arrange
      const input = '<script>alert("XSS")</script>';

      // Act
      const result = pipe.transform(input) as string;

      // Assert
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('</script>');
    });

    it('should remove <script> tags case-insensitively', () => {
      // Arrange
      const input = '<ScRiPt>alert("XSS")</ScRiPt>';

      // Act
      const result = pipe.transform(input) as string;

      // Assert
      expect(result).not.toContain('ScRiPt');
    });

    it('should remove nested script tags', () => {
      // Arrange
      const input = '<script><script>alert("XSS")</script></script>';

      // Act
      const result = pipe.transform(input) as string;

      // Assert
      expect(result).not.toContain('<script>');
    });

    it('should remove script tags with attributes', () => {
      // Arrange
      const input = '<script type="text/javascript">alert("XSS")</script>';

      // Act
      const result = pipe.transform(input) as string;

      // Assert
      expect(result).not.toContain('<script');
      expect(result).not.toContain('</script>');
    });
  });

  describe('XSS protection - HTML tags', () => {
    it('should remove all HTML tags', () => {
      // Arrange
      const input = '<div>Hello</div>';

      // Act
      const result = pipe.transform(input) as string;

      // Assert
      expect(result).not.toContain('<div>');
      expect(result).not.toContain('</div>');
    });

    it('should remove multiple HTML tags', () => {
      // Arrange
      const input = '<p><strong>Bold</strong> text</p>';

      // Act
      const result = pipe.transform(input) as string;

      // Assert
      expect(result).not.toContain('<p>');
      expect(result).not.toContain('<strong>');
      expect(result).not.toContain('</strong>');
      expect(result).not.toContain('</p>');
    });

    it('should remove img tags', () => {
      // Arrange
      const input = '<img src="x" onerror="alert(\'XSS\')">';

      // Act
      const result = pipe.transform(input) as string;

      // Assert
      expect(result).not.toContain('<img');
    });

    it('should remove iframe tags', () => {
      // Arrange
      const input = '<iframe src="javascript:alert(\'XSS\')"></iframe>';

      // Act
      const result = pipe.transform(input) as string;

      // Assert
      expect(result).not.toContain('<iframe');
    });
  });

  describe('XSS protection - dangerous patterns', () => {
    it('should remove javascript: protocol', () => {
      // Arrange
      const input = 'javascript:alert("XSS")';

      // Act
      const result = pipe.transform(input) as string;

      // Assert
      expect(result).not.toContain('javascript:');
    });

    it('should remove event handlers', () => {
      // Arrange
      const input = 'onclick=alert("XSS")';

      // Act
      const result = pipe.transform(input) as string;

      // Assert
      expect(result).not.toContain('onclick=');
    });

    it('should remove onload handlers', () => {
      // Arrange
      const input = 'onload=alert("XSS")';

      // Act
      const result = pipe.transform(input) as string;

      // Assert
      expect(result).not.toContain('onload=');
    });

    it('should remove vbscript: protocol', () => {
      // Arrange
      const input = 'vbscript:msgbox("XSS")';

      // Act
      const result = pipe.transform(input) as string;

      // Assert
      expect(result).not.toContain('vbscript:');
    });

    it('should remove data:text/html protocol', () => {
      // Arrange
      const input = 'data:text/html,<script>alert("XSS")</script>';

      // Act
      const result = pipe.transform(input) as string;

      // Assert
      expect(result).not.toContain('data:text/html');
    });
  });

  describe('HTML entity escaping', () => {
    it('should escape ampersand', () => {
      // Arrange
      const input = 'Tom & Jerry';

      // Act
      const result = pipe.transform(input) as string;

      // Assert
      expect(result).toContain('&amp;');
    });

    it('should escape less than', () => {
      // Arrange
      const input = '5 < 10';

      // Act
      const result = pipe.transform(input) as string;

      // Assert
      expect(result).toContain('&lt;');
    });

    it('should escape greater than', () => {
      // Arrange
      const input = '10 > 5';

      // Act
      const result = pipe.transform(input) as string;

      // Assert
      expect(result).toContain('&gt;');
    });

    it('should escape double quotes', () => {
      // Arrange
      const input = 'He said "Hello"';

      // Act
      const result = pipe.transform(input) as string;

      // Assert
      expect(result).toContain('&quot;');
    });

    it('should escape single quotes', () => {
      // Arrange
      const input = "It's a test";

      // Act
      const result = pipe.transform(input) as string;

      // Assert
      expect(result).toContain('&#x27;');
    });

    it('should escape forward slash', () => {
      // Arrange
      const input = 'path/to/file';

      // Act
      const result = pipe.transform(input) as string;

      // Assert
      expect(result).toContain('&#x2F;');
    });
  });

  describe('SQL injection protection', () => {
    it('should escape single quotes for SQL', () => {
      // Arrange
      const input = "O'Reilly";

      // Act
      const result = pipe.transform(input) as string;

      // Assert
      // Single quotes are HTML escaped to &#x27;
      expect(result).toContain('&#x27;');
    });

    it('should handle multiple single quotes', () => {
      // Arrange
      const input = "It's John's book";

      // Act
      const result = pipe.transform(input) as string;

      // Assert
      // Single quotes are escaped to &#x27;
      expect(result).toContain('&#x27;');
      expect(result).not.toContain("'s");
    });
  });

  describe('array handling', () => {
    it('should sanitize all string elements in array', () => {
      // Arrange
      const input = [
        '<script>alert(1)</script>',
        'normal text',
        '<div>html</div>',
      ];

      // Act
      const result = pipe.transform(input) as string[];

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0]).not.toContain('<script>');
      expect(result[2]).not.toContain('<div>');
    });

    it('should handle mixed type arrays', () => {
      // Arrange
      const input = ['text', 123, true, '<script>XSS</script>'];

      // Act
      const result = pipe.transform(input) as any[];

      // Assert
      expect(result).toHaveLength(4);
      expect(result[1]).toBe(123);
      expect(result[2]).toBe(true);
      expect(result[3]).not.toContain('<script>');
    });

    it('should handle empty arrays', () => {
      // Arrange
      const input: any[] = [];

      // Act
      const result = pipe.transform(input) as any[];

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle nested arrays', () => {
      // Arrange
      const input = [
        ['<script>XSS</script>', 'text'],
        [123, 'more <div>'],
      ];

      // Act
      const result = pipe.transform(input) as any[][];

      // Assert
      expect(result[0][0]).not.toContain('<script>');
      expect(result[1][1]).not.toContain('<div>');
    });
  });

  describe('object handling', () => {
    it('should sanitize object properties', () => {
      // Arrange
      const input = {
        name: '<script>alert(1)</script>John',
        email: 'test@example.com',
      };

      // Act
      const result = pipe.transform(input) as Record<string, any>;

      // Assert
      expect(result.name).not.toContain('<script>');
      expect(typeof result.name).toBe('string');
      expect(result.email).toBeDefined();
    });

    it('should handle nested objects', () => {
      // Arrange
      const input = {
        user: {
          name: '<script>XSS</script>',
          profile: {
            bio: '<div>Bio</div>',
          },
        },
      };

      // Act
      const result = pipe.transform(input) as any;

      // Assert
      expect(result.user.name).not.toContain('<script>');
      expect(result.user.profile.bio).not.toContain('<div>');
    });

    it('should handle objects with mixed types', () => {
      // Arrange
      const input = {
        text: '<script>XSS</script>',
        number: 123,
        bool: true,
        array: ['<div>text</div>'],
      };

      // Act
      const result = pipe.transform(input) as any;

      // Assert
      expect(result.text).not.toContain('<script>');
      expect(result.number).toBe(123);
      expect(result.bool).toBe(true);
      expect(result.array[0]).not.toContain('<div>');
    });

    it('should handle empty objects', () => {
      // Arrange
      const input = {};

      // Act
      const result = pipe.transform(input);

      // Assert
      expect(result).toEqual({});
    });
  });

  describe('edge cases', () => {
    it('should handle empty strings', () => {
      // Arrange
      const input = '';

      // Act
      const result = pipe.transform(input);

      // Assert
      expect(result).toBe('');
    });

    it('should handle whitespace-only strings', () => {
      // Arrange
      const input = '   ';

      // Act
      const result = pipe.transform(input);

      // Assert
      expect(typeof result).toBe('string');
    });

    it('should handle complex malicious input', () => {
      // Arrange
      const input =
        '<script>alert("XSS")</script><img src=x onerror=alert(1)>javascript:alert(1)';

      // Act
      const result = pipe.transform(input) as string;

      // Assert
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('<img');
      expect(result).not.toContain('javascript:');
      expect(result).not.toContain('onerror=');
    });

    it('should preserve safe text content', () => {
      // Arrange
      const input = 'This is safe text with numbers 123 and symbols !@#$%';

      // Act
      const result = pipe.transform(input) as string;

      // Assert
      expect(result).toContain('This is safe text');
      expect(result).toContain('123');
    });

    it('should handle Unicode characters', () => {
      // Arrange
      const input = '日本語テキスト 😀 中文';

      // Act
      const result = pipe.transform(input) as string;

      // Assert
      expect(result).toContain('日本語');
      expect(result).toContain('中文');
      expect(result).toContain('😀');
    });

    it('should handle URL-like strings safely', () => {
      // Arrange
      const input = 'https://example.com/path?query=value';

      // Act
      const result = pipe.transform(input) as string;

      // Assert
      expect(typeof result).toBe('string');
      expect(result).toContain('example.com');
    });
  });

  describe('real-world scenarios', () => {
    it('should sanitize user input form data', () => {
      // Arrange
      const input = {
        username: 'john_doe',
        bio: '<script>alert("XSS")</script>Hi, I am John',
        website: 'javascript:alert("XSS")',
      };

      // Act
      const result = pipe.transform(input) as any;

      // Assert
      expect(result.username).toBe('john_doe');
      expect(result.bio).not.toContain('<script>');
      expect(result.website).not.toContain('javascript:');
    });

    it('should sanitize GraphQL mutation input', () => {
      // Arrange
      const input = {
        name: 'Test Person',
        email: 'test@example.com',
        address: '<img src=x onerror=alert(1)>123 Main St',
      };

      // Act
      const result = pipe.transform(input) as any;

      // Assert
      expect(result.name).toBe('Test Person');
      expect(result.email).toBe('test@example.com');
      expect(result.address).not.toContain('<img');
      expect(result.address).not.toContain('onerror=');
    });

    it('should handle bulk data sanitization', () => {
      // Arrange
      const input = [
        { name: 'User 1', comment: '<script>XSS</script>' },
        { name: 'User 2', comment: 'Safe comment' },
        { name: 'User 3', comment: '<div onclick="alert(1)">Click</div>' },
      ];

      // Act
      const result = pipe.transform(input) as any[];

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].comment).not.toContain('<script>');
      expect(result[1].comment).toBe('Safe comment');
      expect(result[2].comment).not.toContain('onclick=');
    });
  });
});
