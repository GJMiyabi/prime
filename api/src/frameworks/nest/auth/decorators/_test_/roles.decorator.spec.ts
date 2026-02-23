import { Roles, ROLES_KEY } from '../roles.decorator';
import { PrincipalKind } from 'src/domains/type/principal-kind';

describe('Roles Decorator', () => {
  describe('ROLES_KEY constant', () => {
    it('should be defined', () => {
      expect(ROLES_KEY).toBeDefined();
    });

    it('should have correct value', () => {
      expect(ROLES_KEY).toBe('roles');
    });
  });

  describe('Roles function', () => {
    it('should be defined', () => {
      expect(Roles).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof Roles).toBe('function');
    });

    it('should return a decorator function', () => {
      const decorator = Roles(PrincipalKind.ADMIN);
      expect(typeof decorator).toBe('function');
    });
  });

  describe('Metadata setting', () => {
    class TestClass {
      testMethod() {
        return 'test';
      }
    }

    it('should set metadata for single role', () => {
      // Act
      const decorator = Roles(PrincipalKind.ADMIN);
      const descriptor = Object.getOwnPropertyDescriptor(
        TestClass.prototype,
        'testMethod',
      );
      decorator(TestClass.prototype, 'testMethod', descriptor!);

      // Assert
      const metadata = Reflect.getMetadata(
        ROLES_KEY,
        TestClass.prototype.testMethod,
      );
      expect(metadata).toEqual([PrincipalKind.ADMIN]);
    });

    it('should set metadata for multiple roles', () => {
      // Act
      const decorator = Roles(PrincipalKind.ADMIN, PrincipalKind.TEACHER);
      const descriptor = Object.getOwnPropertyDescriptor(
        TestClass.prototype,
        'testMethod',
      );
      decorator(TestClass.prototype, 'testMethod', descriptor!);

      // Assert
      const metadata = Reflect.getMetadata(
        ROLES_KEY,
        TestClass.prototype.testMethod,
      );
      expect(metadata).toEqual([PrincipalKind.ADMIN, PrincipalKind.TEACHER]);
    });

    it('should set metadata for all role types', () => {
      // Act
      const decorator = Roles(
        PrincipalKind.ADMIN,
        PrincipalKind.TEACHER,
        PrincipalKind.STUDENT,
      );
      const descriptor = Object.getOwnPropertyDescriptor(
        TestClass.prototype,
        'testMethod',
      );
      decorator(TestClass.prototype, 'testMethod', descriptor!);

      // Assert
      const metadata = Reflect.getMetadata(
        ROLES_KEY,
        TestClass.prototype.testMethod,
      );
      expect(metadata).toEqual([
        PrincipalKind.ADMIN,
        PrincipalKind.TEACHER,
        PrincipalKind.STUDENT,
      ]);
    });

    it('should preserve order of roles', () => {
      // Act
      const decorator = Roles(PrincipalKind.STUDENT, PrincipalKind.ADMIN);
      const descriptor = Object.getOwnPropertyDescriptor(
        TestClass.prototype,
        'testMethod',
      );
      decorator(TestClass.prototype, 'testMethod', descriptor!);

      // Assert
      const metadata = Reflect.getMetadata(
        ROLES_KEY,
        TestClass.prototype.testMethod,
      );
      expect(metadata[0]).toBe(PrincipalKind.STUDENT);
      expect(metadata[1]).toBe(PrincipalKind.ADMIN);
    });

    it('should work with empty roles array', () => {
      // Act
      const decorator = Roles();
      const descriptor = Object.getOwnPropertyDescriptor(
        TestClass.prototype,
        'testMethod',
      );
      decorator(TestClass.prototype, 'testMethod', descriptor!);

      // Assert
      const metadata = Reflect.getMetadata(
        ROLES_KEY,
        TestClass.prototype.testMethod,
      );
      expect(metadata).toEqual([]);
    });

    it('should handle duplicate roles', () => {
      // Act
      const decorator = Roles(PrincipalKind.ADMIN, PrincipalKind.ADMIN);
      const descriptor = Object.getOwnPropertyDescriptor(
        TestClass.prototype,
        'testMethod',
      );
      decorator(TestClass.prototype, 'testMethod', descriptor!);

      // Assert
      const metadata = Reflect.getMetadata(
        ROLES_KEY,
        TestClass.prototype.testMethod,
      );
      expect(metadata).toEqual([PrincipalKind.ADMIN, PrincipalKind.ADMIN]);
      expect(metadata.length).toBe(2);
    });
  });

  describe('Usage with class methods', () => {
    it('should work with resolver methods', () => {
      // Arrange
      class TestResolver {
        @Roles(PrincipalKind.ADMIN)
        deleteUser() {
          return 'deleted';
        }
      }

      // Act
      const metadata = Reflect.getMetadata(
        ROLES_KEY,
        TestResolver.prototype.deleteUser,
      );

      // Assert
      expect(metadata).toEqual([PrincipalKind.ADMIN]);
    });

    it('should work with multiple decorators', () => {
      // Arrange
      class TestResolver {
        @Roles(PrincipalKind.TEACHER)
        updateGrade() {
          return 'updated';
        }

        @Roles(PrincipalKind.STUDENT)
        viewGrade() {
          return 'viewed';
        }
      }

      // Act
      const updateMetadata = Reflect.getMetadata(
        ROLES_KEY,
        TestResolver.prototype.updateGrade,
      );
      const viewMetadata = Reflect.getMetadata(
        ROLES_KEY,
        TestResolver.prototype.viewGrade,
      );

      // Assert
      expect(updateMetadata).toEqual([PrincipalKind.TEACHER]);
      expect(viewMetadata).toEqual([PrincipalKind.STUDENT]);
    });

    it('should not interfere with other methods', () => {
      // Arrange
      class TestResolver {
        @Roles(PrincipalKind.ADMIN)
        adminMethod() {
          return 'admin';
        }

        publicMethod() {
          return 'public';
        }
      }

      // Act
      const adminMetadata = Reflect.getMetadata(
        ROLES_KEY,
        TestResolver.prototype.adminMethod,
      );
      const publicMetadata = Reflect.getMetadata(
        ROLES_KEY,
        TestResolver.prototype.publicMethod,
      );

      // Assert
      expect(adminMetadata).toEqual([PrincipalKind.ADMIN]);
      expect(publicMetadata).toBeUndefined();
    });
  });

  describe('PrincipalKind enum values', () => {
    it('should work with ADMIN role', () => {
      const decorator = Roles(PrincipalKind.ADMIN);
      expect(decorator).toBeDefined();
    });

    it('should work with TEACHER role', () => {
      const decorator = Roles(PrincipalKind.TEACHER);
      expect(decorator).toBeDefined();
    });

    it('should work with STUDENT role', () => {
      const decorator = Roles(PrincipalKind.STUDENT);
      expect(decorator).toBeDefined();
    });
  });
});
