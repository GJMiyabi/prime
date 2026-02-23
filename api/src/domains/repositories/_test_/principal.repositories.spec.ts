/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
import {
  IPrincipalCommandRepository,
  IPrincipalQueryRepository,
} from '../principal.repositories';
import { Principal } from '../../entities/principal';
import { Id } from '../../value-object/id';
import { PrincipalKind } from '../../type/principal-kind';

// Mock implementations for testing
class MockPrincipalCommandRepository extends IPrincipalCommandRepository {
  async create(data: Principal): Promise<Principal> {
    return data;
  }

  async update(d: Principal): Promise<Principal> {
    return d;
  }

  async delete(personId: Id): Promise<void> {
    return;
  }
}

class MockPrincipalQueryRepository extends IPrincipalQueryRepository {
  async findByPersonId(personId: string): Promise<Principal | undefined> {
    return new Principal({
      personId: new Id(personId),
      kind: PrincipalKind.STUDENT,
    });
  }
}

describe('IPrincipalCommandRepository', () => {
  let repository: IPrincipalCommandRepository;

  beforeEach(() => {
    repository = new MockPrincipalCommandRepository();
  });

  describe('create', () => {
    it('should create a principal and return it', async () => {
      // Arrange
      const principal = new Principal({
        personId: new Id(),
        kind: PrincipalKind.TEACHER,
      });

      // Act
      const result = await repository.create(principal);

      // Assert
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Principal);
      expect(result.getKind()).toBe(PrincipalKind.TEACHER);
    });

    it('should accept principal with all kinds', async () => {
      // Arrange
      const kinds = [
        PrincipalKind.ADMIN,
        PrincipalKind.TEACHER,
        PrincipalKind.STUDENT,
        PrincipalKind.STAKEHOLDER,
      ];

      // Act & Assert
      for (const kind of kinds) {
        const principal = new Principal({
          personId: new Id(),
          kind,
        });
        const result = await repository.create(principal);
        expect(result.getKind()).toBe(kind);
      }
    });

    it('should accept principal with account', async () => {
      // Arrange
      const principal = new Principal({
        personId: new Id(),
        kind: PrincipalKind.ADMIN,
      });

      // Act
      const result = await repository.create(principal);

      // Assert
      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update a principal and return it', async () => {
      // Arrange
      const principal = new Principal({
        id: new Id(),
        personId: new Id(),
        kind: PrincipalKind.TEACHER,
      });

      // Act
      const result = await repository.update(principal);

      // Assert
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Principal);
      expect(result.getKind()).toBe(PrincipalKind.TEACHER);
    });

    it('should preserve principal id on update', async () => {
      // Arrange
      const id = new Id();
      const principal = new Principal({
        id,
        personId: new Id(),
        kind: PrincipalKind.STUDENT,
      });

      // Act
      const result = await repository.update(principal);

      // Assert
      expect(result.getId()).toBe(id.value);
    });
  });

  describe('delete', () => {
    it('should delete a principal by person id', async () => {
      // Arrange
      const personId = new Id();

      // Act & Assert
      await expect(repository.delete(personId)).resolves.toBeUndefined();
    });

    it('should accept Id value object', async () => {
      // Arrange
      const personId = new Id();

      // Act
      const result = await repository.delete(personId);

      // Assert
      expect(result).toBeUndefined();
    });
  });
});

describe('IPrincipalQueryRepository', () => {
  let repository: IPrincipalQueryRepository;

  beforeEach(() => {
    repository = new MockPrincipalQueryRepository();
  });

  describe('findByPersonId', () => {
    it('should find a principal by person id', async () => {
      // Arrange
      const personId = new Id().value;

      // Act
      const result = await repository.findByPersonId(personId);

      // Assert
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Principal);
      expect(result?.getPersonId()).toBe(personId);
    });

    it('should accept string person id', async () => {
      // Arrange
      const personId = new Id().value;

      // Act
      const result = await repository.findByPersonId(personId);

      // Assert
      expect(result).toBeDefined();
      expect(typeof result?.getPersonId()).toBe('string');
    });

    it('should return undefined for non-existent person', async () => {
      // Arrange
      const repository = new (class extends IPrincipalQueryRepository {
        async findByPersonId(
          _personId: string,
        ): Promise<Principal | undefined> {
          return undefined;
        }
      })();
      const personId = new Id().value;

      // Act
      const result = await repository.findByPersonId(personId);

      // Assert
      expect(result).toBeUndefined();
    });

    it('should return principal with correct kind', async () => {
      // Arrange
      const personId = new Id().value;

      // Act
      const result = await repository.findByPersonId(personId);

      // Assert
      expect(result).toBeDefined();
      expect(Object.values(PrincipalKind)).toContain(result?.getKind());
    });
  });
});
