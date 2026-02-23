import { SkipCsrf, SKIP_CSRF_KEY } from '../skip-csrf.decorator';

describe('SkipCsrf Decorator', () => {
  describe('SKIP_CSRF_KEY constant', () => {
    it('should be defined', () => {
      expect(SKIP_CSRF_KEY).toBeDefined();
    });

    it('should have correct value', () => {
      expect(SKIP_CSRF_KEY).toBe('skipCsrf');
    });
  });

  describe('SkipCsrf function', () => {
    it('should be defined', () => {
      expect(SkipCsrf).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof SkipCsrf).toBe('function');
    });

    it('should return a decorator function', () => {
      const decorator = SkipCsrf();
      expect(typeof decorator).toBe('function');
    });
  });

  describe('Metadata setting', () => {
    class TestClass {
      testMethod() {
        return 'test';
      }
    }

    it('should set metadata to true', () => {
      // Act
      const decorator = SkipCsrf();
      const descriptor = Object.getOwnPropertyDescriptor(
        TestClass.prototype,
        'testMethod',
      );
      decorator(TestClass.prototype, 'testMethod', descriptor!);

      // Assert
      const metadata = Reflect.getMetadata(
        SKIP_CSRF_KEY,
        TestClass.prototype.testMethod,
      );
      expect(metadata).toBe(true);
    });

    it('should always set metadata to true', () => {
      // Act
      const decorator1 = SkipCsrf();
      const decorator2 = SkipCsrf();

      class Test1 {
        method1() {
          return 'test1';
        }
      }

      class Test2 {
        method2() {
          return 'test2';
        }
      }

      const descriptor1 = Object.getOwnPropertyDescriptor(
        Test1.prototype,
        'method1',
      );
      const descriptor2 = Object.getOwnPropertyDescriptor(
        Test2.prototype,
        'method2',
      );

      decorator1(Test1.prototype, 'method1', descriptor1!);
      decorator2(Test2.prototype, 'method2', descriptor2!);

      // Assert
      const metadata1 = Reflect.getMetadata(
        SKIP_CSRF_KEY,
        Test1.prototype.method1,
      );
      const metadata2 = Reflect.getMetadata(
        SKIP_CSRF_KEY,
        Test2.prototype.method2,
      );

      expect(metadata1).toBe(true);
      expect(metadata2).toBe(true);
    });
  });

  describe('Usage with class methods', () => {
    it('should work with resolver methods', () => {
      // Arrange
      class AuthResolver {
        @SkipCsrf()
        login() {
          return 'logged in';
        }
      }

      // Act
      const metadata = Reflect.getMetadata(
        SKIP_CSRF_KEY,
        AuthResolver.prototype.login,
      );

      // Assert
      expect(metadata).toBe(true);
    });

    it('should work with multiple methods', () => {
      // Arrange
      class TestResolver {
        @SkipCsrf()
        publicEndpoint1() {
          return 'public1';
        }

        @SkipCsrf()
        publicEndpoint2() {
          return 'public2';
        }

        protectedEndpoint() {
          return 'protected';
        }
      }

      // Act
      const public1Metadata = Reflect.getMetadata(
        SKIP_CSRF_KEY,
        TestResolver.prototype.publicEndpoint1,
      );
      const public2Metadata = Reflect.getMetadata(
        SKIP_CSRF_KEY,
        TestResolver.prototype.publicEndpoint2,
      );
      const protectedMetadata = Reflect.getMetadata(
        SKIP_CSRF_KEY,
        TestResolver.prototype.protectedEndpoint,
      );

      // Assert
      expect(public1Metadata).toBe(true);
      expect(public2Metadata).toBe(true);
      expect(protectedMetadata).toBeUndefined();
    });

    it('should not affect methods without decorator', () => {
      // Arrange
      class TestResolver {
        @SkipCsrf()
        skipCsrfMethod() {
          return 'skip';
        }

        normalMethod() {
          return 'normal';
        }
      }

      // Act
      const skipMetadata = Reflect.getMetadata(
        SKIP_CSRF_KEY,
        TestResolver.prototype.skipCsrfMethod,
      );
      const normalMetadata = Reflect.getMetadata(
        SKIP_CSRF_KEY,
        TestResolver.prototype.normalMethod,
      );

      // Assert
      expect(skipMetadata).toBe(true);
      expect(normalMetadata).toBeUndefined();
    });
  });

  describe('Use cases', () => {
    it('should be used on login endpoint', () => {
      // Arrange
      class AuthResolver {
        @SkipCsrf()
        login() {
          return { token: 'jwt' };
        }
      }

      // Act
      const metadata = Reflect.getMetadata(
        SKIP_CSRF_KEY,
        AuthResolver.prototype.login,
      );

      // Assert
      expect(metadata).toBe(true);
    });

    it('should be used on registration endpoint', () => {
      // Arrange
      class AuthResolver {
        @SkipCsrf()
        register() {
          return { success: true };
        }
      }

      // Act
      const metadata = Reflect.getMetadata(
        SKIP_CSRF_KEY,
        AuthResolver.prototype.register,
      );

      // Assert
      expect(metadata).toBe(true);
    });

    it('should be used on password reset endpoint', () => {
      // Arrange
      class AuthResolver {
        @SkipCsrf()
        resetPassword() {
          return { success: true };
        }
      }

      // Act
      const metadata = Reflect.getMetadata(
        SKIP_CSRF_KEY,
        AuthResolver.prototype.resetPassword,
      );

      // Assert
      expect(metadata).toBe(true);
    });
  });

  describe('Decorator behavior', () => {
    it('should be idempotent', () => {
      // Arrange
      class TestClass {
        testMethod() {
          return 'test';
        }
      }

      // Act - Apply decorator twice
      const decorator = SkipCsrf();
      const descriptor = Object.getOwnPropertyDescriptor(
        TestClass.prototype,
        'testMethod',
      );
      decorator(TestClass.prototype, 'testMethod', descriptor!);
      decorator(TestClass.prototype, 'testMethod', descriptor!);

      // Assert
      const metadata = Reflect.getMetadata(
        SKIP_CSRF_KEY,
        TestClass.prototype.testMethod,
      );
      expect(metadata).toBe(true);
    });
  });

  describe('Integration with CSRF Guard', () => {
    it('should allow CSRF Guard to skip validation', () => {
      // Arrange
      class TestResolver {
        @SkipCsrf()
        publicMutation() {
          return 'success';
        }
      }

      // Act
      const skipCsrf = Reflect.getMetadata(
        SKIP_CSRF_KEY,
        TestResolver.prototype.publicMutation,
      );

      // Assert
      // CSRF Guardはこのメタデータをチェックして検証をスキップする
      expect(skipCsrf).toBe(true);
    });
  });
});
