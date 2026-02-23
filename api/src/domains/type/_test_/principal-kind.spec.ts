import { PrincipalKind } from '../principal-kind';

describe('PrincipalKind Enum', () => {
  describe('enum values', () => {
    it('should have ADMIN value', () => {
      // Act & Assert
      expect(PrincipalKind.ADMIN).toBe('ADMIN');
    });

    it('should have TEACHER value', () => {
      // Act & Assert
      expect(PrincipalKind.TEACHER).toBe('TEACHER');
    });

    it('should have STUDENT value', () => {
      // Act & Assert
      expect(PrincipalKind.STUDENT).toBe('STUDENT');
    });

    it('should have STAKEHOLDER value', () => {
      // Act & Assert
      expect(PrincipalKind.STAKEHOLDER).toBe('STAKEHOLDER');
    });
  });

  describe('enum membership', () => {
    it('should contain all expected values', () => {
      // Arrange
      const expectedValues = ['ADMIN', 'TEACHER', 'STUDENT', 'STAKEHOLDER'];

      // Act
      const actualValues = Object.values(PrincipalKind);

      // Assert
      expect(actualValues).toEqual(expectedValues);
      expect(actualValues).toHaveLength(4);
    });

    it('should not contain unexpected values', () => {
      // Arrange
      const values = Object.values(PrincipalKind);

      // Act & Assert
      expect(values).not.toContain('GUEST');
      expect(values).not.toContain('USER');
      expect(values).not.toContain('MODERATOR');
    });
  });

  describe('type checking', () => {
    it('should accept valid PrincipalKind values', () => {
      // Arrange
      const checkKind = (kind: PrincipalKind): boolean => {
        return Object.values(PrincipalKind).includes(kind);
      };

      // Act & Assert
      expect(checkKind(PrincipalKind.ADMIN)).toBe(true);
      expect(checkKind(PrincipalKind.TEACHER)).toBe(true);
      expect(checkKind(PrincipalKind.STUDENT)).toBe(true);
      expect(checkKind(PrincipalKind.STAKEHOLDER)).toBe(true);
    });

    it('should allow comparison with string literals', () => {
      // Arrange
      const adminKind = PrincipalKind.ADMIN;
      const teacherKind = PrincipalKind.TEACHER;
      const studentKind = PrincipalKind.STUDENT;
      const stakeholderKind = PrincipalKind.STAKEHOLDER;

      // Act & Assert
      expect(adminKind).toBe('ADMIN');
      expect(teacherKind).toBe('TEACHER');
      expect(studentKind).toBe('STUDENT');
      expect(stakeholderKind).toBe('STAKEHOLDER');
    });
  });

  describe('enum keys', () => {
    it('should have correct enum keys', () => {
      // Arrange
      const expectedKeys = ['ADMIN', 'TEACHER', 'STUDENT', 'STAKEHOLDER'];

      // Act
      const actualKeys = Object.keys(PrincipalKind);

      // Assert
      expect(actualKeys).toEqual(expectedKeys);
    });
  });

  describe('usage in switch statements', () => {
    it('should work correctly in switch cases', () => {
      // Arrange
      const getKindLabel = (kind: PrincipalKind): string => {
        switch (kind) {
          case PrincipalKind.ADMIN:
            return 'Administrator';
          case PrincipalKind.TEACHER:
            return 'Teacher';
          case PrincipalKind.STUDENT:
            return 'Student';
          case PrincipalKind.STAKEHOLDER:
            return 'Stakeholder';
          default:
            return 'Unknown';
        }
      };

      // Act & Assert
      expect(getKindLabel(PrincipalKind.ADMIN)).toBe('Administrator');
      expect(getKindLabel(PrincipalKind.TEACHER)).toBe('Teacher');
      expect(getKindLabel(PrincipalKind.STUDENT)).toBe('Student');
      expect(getKindLabel(PrincipalKind.STAKEHOLDER)).toBe('Stakeholder');
    });
  });

  describe('permission levels', () => {
    it('should define hierarchy for permission checks', () => {
      // Arrange
      const getPermissionLevel = (kind: PrincipalKind): number => {
        switch (kind) {
          case PrincipalKind.ADMIN:
            return 4;
          case PrincipalKind.TEACHER:
            return 3;
          case PrincipalKind.STAKEHOLDER:
            return 2;
          case PrincipalKind.STUDENT:
            return 1;
          default:
            return 0;
        }
      };

      // Act & Assert
      expect(getPermissionLevel(PrincipalKind.ADMIN)).toBeGreaterThan(
        getPermissionLevel(PrincipalKind.TEACHER),
      );
      expect(getPermissionLevel(PrincipalKind.TEACHER)).toBeGreaterThan(
        getPermissionLevel(PrincipalKind.STAKEHOLDER),
      );
      expect(getPermissionLevel(PrincipalKind.STAKEHOLDER)).toBeGreaterThan(
        getPermissionLevel(PrincipalKind.STUDENT),
      );
    });
  });

  describe('validation helper', () => {
    it('should validate if a string is a valid PrincipalKind', () => {
      // Arrange
      const isValidPrincipalKind = (value: string): value is PrincipalKind => {
        return Object.values(PrincipalKind).includes(value as PrincipalKind);
      };

      // Act & Assert
      expect(isValidPrincipalKind('ADMIN')).toBe(true);
      expect(isValidPrincipalKind('TEACHER')).toBe(true);
      expect(isValidPrincipalKind('STUDENT')).toBe(true);
      expect(isValidPrincipalKind('STAKEHOLDER')).toBe(true);
      expect(isValidPrincipalKind('INVALID')).toBe(false);
      expect(isValidPrincipalKind('admin')).toBe(false);
      expect(isValidPrincipalKind('')).toBe(false);
    });
  });

  describe('role-based filtering', () => {
    it('should filter principals by kind', () => {
      // Arrange
      const principals = [
        { id: '1', kind: PrincipalKind.ADMIN },
        { id: '2', kind: PrincipalKind.TEACHER },
        { id: '3', kind: PrincipalKind.STUDENT },
        { id: '4', kind: PrincipalKind.TEACHER },
      ];

      // Act
      const teachers = principals.filter(
        (p) => p.kind === PrincipalKind.TEACHER,
      );
      const admins = principals.filter((p) => p.kind === PrincipalKind.ADMIN);
      const students = principals.filter(
        (p) => p.kind === PrincipalKind.STUDENT,
      );

      // Assert
      expect(teachers).toHaveLength(2);
      expect(admins).toHaveLength(1);
      expect(students).toHaveLength(1);
    });
  });
});
