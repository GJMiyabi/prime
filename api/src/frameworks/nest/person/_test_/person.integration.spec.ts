import { Test, TestingModule } from '@nestjs/testing';
import { PersonInteractor } from 'src/usecases/person/interactor';
import {
  IPersonInputPort,
  PersonCreateDto,
  AdminPersonCreateDto,
  PersonIncludeOptions,
} from 'src/usecases/person/input-port';
import {
  PersonCommandRepository,
  PersonQueryRepository,
} from 'src/interface-adapters/repositories/prisma/person.repository';
import {
  IPersonCommandRepository,
  IPersonQueryRepository,
} from 'src/domains/repositories/person.repositories';
import {
  PrincipalCommandRepository,
  PrincipalQueryRepository,
} from 'src/interface-adapters/repositories/prisma/principal.repository';
import {
  IPrincipalCommandRepository,
  IPrincipalQueryRepository,
} from 'src/domains/repositories/principal.repositories';
import {
  AccountCommandRepository,
  AccountQueryRepository,
} from 'src/interface-adapters/repositories/prisma/account.repository';
import {
  IAccountCommandRepository,
  IAccountQueryRepository,
} from 'src/domains/repositories/account.repositories';
import {
  ContactAddressCommandRepository,
  ContactAddressQueryRepository,
} from 'src/interface-adapters/repositories/prisma/contract-address.repository';
import {
  IContactAddressCommandRepository,
  IContactAddressQueryRepository,
} from 'src/domains/repositories/contract-address.repositories';
import { PrismaClientSingleton } from 'src/interface-adapters/shared/prisma-client';
import { ContactType } from 'src/domains/type/contact';
import { PrincipalKind } from 'src/domains/type/principal-kind';

describe('Person CRUD Integration Tests', () => {
  let personInteractor: PersonInteractor;
  let prisma: typeof PrismaClientSingleton.instance;

  // テストデータのID管理
  const testPersonIds: string[] = [];
  const testPrincipalIds: string[] = [];
  const testAccountIds: string[] = [];

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: IPersonInputPort, useClass: PersonInteractor },
        {
          provide: IPersonCommandRepository,
          useClass: PersonCommandRepository,
        },
        { provide: IPersonQueryRepository, useClass: PersonQueryRepository },
        {
          provide: IPrincipalCommandRepository,
          useClass: PrincipalCommandRepository,
        },
        {
          provide: IPrincipalQueryRepository,
          useClass: PrincipalQueryRepository,
        },
        {
          provide: IAccountCommandRepository,
          useClass: AccountCommandRepository,
        },
        { provide: IAccountQueryRepository, useClass: AccountQueryRepository },
        {
          provide: IContactAddressCommandRepository,
          useClass: ContactAddressCommandRepository,
        },
        {
          provide: IContactAddressQueryRepository,
          useClass: ContactAddressQueryRepository,
        },
      ],
    }).compile();

    personInteractor = moduleFixture.get<PersonInteractor>(IPersonInputPort);
    prisma = PrismaClientSingleton.instance;
  });

  afterAll(async () => {
    // テストデータのクリーンアップ
    for (const id of testAccountIds) {
      await prisma.account.delete({ where: { id } }).catch(() => {});
    }
    for (const id of testPrincipalIds) {
      await prisma.principal.delete({ where: { id } }).catch(() => {});
    }
    for (const id of testPersonIds) {
      await prisma.contactAddress
        .deleteMany({ where: { personId: id } })
        .catch(() => {});
      await prisma.person.delete({ where: { id } }).catch(() => {});
    }

    delete process.env.NODE_ENV;
  });

  describe('Person Creation Integration', () => {
    it('新しいPersonとContactAddressを作成できる', async () => {
      // Arrange
      const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const input: PersonCreateDto = {
        name: `Test Person ${uniqueSuffix}`,
        contactValue: `test${uniqueSuffix}@example.com`,
        contactType: ContactType.EMAIL,
      };

      // Act
      const result = await personInteractor.createPerson(input);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(input.name);
      expect(result.contacts).toHaveLength(1);
      expect(result.contacts![0].value).toBe(input.contactValue);
      expect(result.contacts![0].type).toBe(ContactType.EMAIL);

      // テストデータIDを記録
      testPersonIds.push(result.id);
    });

    it('contactTypeを指定しない場合、デフォルトでEMAILが使用される', async () => {
      // Arrange
      const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const input: PersonCreateDto = {
        name: `Test Person Default ${uniqueSuffix}`,
        contactValue: `default${uniqueSuffix}@example.com`,
        // contactType を指定しない
      };

      // Act
      const result = await personInteractor.createPerson(input);

      // Assert
      expect(result.contacts![0].type).toBe(ContactType.EMAIL);

      testPersonIds.push(result.id);
    });
  });

  describe('Admin Person Creation Integration', () => {
    it('Admin PersonとPrincipal、Accountを作成できる', async () => {
      // Arrange
      const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const input: AdminPersonCreateDto = {
        name: `Admin Person ${uniqueSuffix}`,
        contactValue: `admin${uniqueSuffix}@example.com`,
        contactType: ContactType.EMAIL,
      };

      // Act
      const result = await personInteractor.createAdmin(input);

      // PrincipalとAccountを含めて再取得
      const fullResult = await personInteractor.find(result.id, {
        principal: { include: { account: true } },
      });

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(input.name);
      expect(result.contacts).toHaveLength(1);
      expect(fullResult!.principal).toBeDefined();
      expect(fullResult!.principal!.kind).toBe(PrincipalKind.ADMIN);
      expect(fullResult!.principal!.account).toBeDefined();
      expect(fullResult!.principal!.account!.username).toBe(input.contactValue);

      // テストデータIDを記録
      testPersonIds.push(result.id);
      testPrincipalIds.push(fullResult!.principal!.id);
      testAccountIds.push(fullResult!.principal!.account!.id);
    });

    it('作成されたAccountは実際にデータベースに保存される', async () => {
      // Arrange
      const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const input: AdminPersonCreateDto = {
        name: `Admin DB Check ${uniqueSuffix}`,
        contactValue: `admindb${uniqueSuffix}@example.com`,
        contactType: ContactType.EMAIL,
      };

      // Act
      const result = await personInteractor.createAdmin(input);

      // PrincipalとAccountを含めて再取得
      const fullResult = await personInteractor.find(result.id, {
        principal: { include: { account: true } },
      });

      // Assert - データベースから直接確認
      const dbAccount = await prisma.account.findUnique({
        where: { id: fullResult!.principal!.account!.id },
      });
      expect(dbAccount).toBeDefined();
      expect(dbAccount!.username).toBe(input.contactValue);
      expect(dbAccount!.isActive).toBe(true);

      testPersonIds.push(result.id);
      testPrincipalIds.push(fullResult!.principal!.id);
      testAccountIds.push(fullResult!.principal!.account!.id);
    });
  });

  describe('Person Query Integration', () => {
    let createdPersonId: string;

    beforeAll(async () => {
      // テスト用のPersonを作成
      const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const result = await personInteractor.createPerson({
        name: `Query Test Person ${uniqueSuffix}`,
        contactValue: `query${uniqueSuffix}@example.com`,
        contactType: ContactType.EMAIL,
      });
      createdPersonId = result.id;
      testPersonIds.push(createdPersonId);
    });

    it('IDでPersonを取得できる', async () => {
      // Act
      const result = await personInteractor.find(createdPersonId);

      // Assert
      expect(result).toBeDefined();
      expect(result!.id).toBe(createdPersonId);
      expect(result!.name).toBeDefined();
    });

    it('ContactAddressを含めて取得できる', async () => {
      // Arrange
      const include: PersonIncludeOptions = {
        contacts: true,
      };

      // Act
      const result = await personInteractor.find(createdPersonId, include);

      // Assert
      expect(result).toBeDefined();
      expect(result!.contacts).toBeDefined();
      expect(result!.contacts!.length).toBeGreaterThan(0);
    });

    it('存在しないIDでは undefined が返る', async () => {
      // Arrange
      const nonExistentId = 'cuid0000000000000000000000';

      // Act
      const result = await personInteractor.find(nonExistentId);

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('Person Update Integration', () => {
    let personToUpdate: string;

    beforeAll(async () => {
      // テスト用のPersonを作成
      const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const result = await personInteractor.createPerson({
        name: `Update Test Person ${uniqueSuffix}`,
        contactValue: `update${uniqueSuffix}@example.com`,
      });
      personToUpdate = result.id;
      testPersonIds.push(personToUpdate);
    });

    it('Personの名前を更新できる', async () => {
      // Arrange
      const newName = `Updated Name ${Date.now()}`;
      const personQueryRepository = new PersonQueryRepository();
      const personCommandRepository = new PersonCommandRepository();
      const { Id } = await import('src/domains/value-object/id');
      const oldPerson = await personQueryRepository.find(
        new Id(personToUpdate),
      );

      // Act - Personエンティティを再構築して更新
      const updatedPerson = new (oldPerson!.constructor as any)({
        id: oldPerson!.id,
        name: newName,
        contacts: oldPerson!.contacts,
        principal: oldPerson!.principal,
        facilities: oldPerson!.facilities,
        organization: oldPerson!.organization,
      });
      await personCommandRepository.update(updatedPerson);

      // Assert
      const result = await personInteractor.find(personToUpdate);
      expect(result!.name).toBe(newName);
    });

    it('更新後のデータがデータベースに永続化される', async () => {
      // Arrange
      const newName = `DB Persist Name ${Date.now()}`;
      const personQueryRepository = new PersonQueryRepository();
      const personCommandRepository = new PersonCommandRepository();
      const { Id } = await import('src/domains/value-object/id');
      const oldPerson = await personQueryRepository.find(
        new Id(personToUpdate),
      );

      // Act - Personエンティティを再構築して更新
      const updatedPerson = new (oldPerson!.constructor as any)({
        id: oldPerson!.id,
        name: newName,
        contacts: oldPerson!.contacts,
        principal: oldPerson!.principal,
        facilities: oldPerson!.facilities,
        organization: oldPerson!.organization,
      });
      await personCommandRepository.update(updatedPerson);

      // Assert - データベースから直接確認
      const dbPerson = await prisma.person.findUnique({
        where: { id: personToUpdate },
      });
      expect(dbPerson!.name).toBe(newName);
    });
  });

  describe('Person Delete Integration', () => {
    it('Personを削除できる', async () => {
      // Arrange
      const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const created = await personInteractor.createPerson({
        name: `Delete Test Person ${uniqueSuffix}`,
        contactValue: `delete${uniqueSuffix}@example.com`,
      });

      // Act
      await personInteractor.delete(created.id);

      // Assert
      const result = await personInteractor.find(created.id);
      expect(result).toBeUndefined();
    });

    it('Personを削除すると関連するContactAddressも削除される', async () => {
      // Arrange
      const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const created = await personInteractor.createPerson({
        name: `Cascade Delete Test ${uniqueSuffix}`,
        contactValue: `cascade${uniqueSuffix}@example.com`,
      });
      const personId = created.id;
      const contactId = created.contacts![0].id;

      // Act
      await personInteractor.delete(personId);

      // Assert
      const dbContact = await prisma.contactAddress.findUnique({
        where: { id: contactId },
      });
      expect(dbContact).toBeNull();
    });
  });

  describe('Person Cascade Delete Integration', () => {
    it('Admin Personを削除すると Principal と Account も削除される', async () => {
      // Arrange
      const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const admin = await personInteractor.createAdmin({
        name: `Cascade Admin ${uniqueSuffix}`,
        contactValue: `cascadeadmin${uniqueSuffix}@example.com`,
        contactType: ContactType.EMAIL,
      });

      // PrincipalとAccountを含めて再取得
      const fullAdmin = await personInteractor.find(admin.id, {
        principal: { include: { account: true } },
      });

      const personId = admin.id;
      const principalId = fullAdmin!.principal!.id;
      const accountId = fullAdmin!.principal!.account!.id;

      // Act
      await personInteractor.delete(personId);

      // Assert
      const dbPerson = await prisma.person.findUnique({
        where: { id: personId },
      });
      const dbPrincipal = await prisma.principal.findUnique({
        where: { id: principalId },
      });
      const dbAccount = await prisma.account.findUnique({
        where: { id: accountId },
      });

      expect(dbPerson).toBeNull();
      expect(dbPrincipal).toBeNull();
      expect(dbAccount).toBeNull();
    });
  });

  describe('ContactAddress Relationship Integration', () => {
    it('複数のContactAddressを持つPersonを作成できる', async () => {
      // Arrange
      const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const person = await personInteractor.createPerson({
        name: `Multi Contact Person ${uniqueSuffix}`,
        contactValue: `multi${uniqueSuffix}@example.com`,
      });

      // 2つ目のContactAddressを追加
      const { ContactAddress } = await import(
        'src/domains/entities/contact-address'
      );
      const { Id } = await import('src/domains/value-object/id');
      const contactAddressRepo = new ContactAddressCommandRepository();
      const secondContact = new ContactAddress({
        id: new Id(),
        personId: new Id(person.id),
        type: ContactType.PHONE,
        value: '090-1234-5678',
      });
      await contactAddressRepo.create(secondContact);

      // Act
      const result = await personInteractor.find(person.id, { contacts: true });

      // Assert
      expect(result!.contacts).toHaveLength(2);
      const emailContact = result!.contacts!.find(
        (c) => c.type === ContactType.EMAIL,
      );
      const phoneContact = result!.contacts!.find(
        (c) => c.type === ContactType.PHONE,
      );
      expect(emailContact).toBeDefined();
      expect(phoneContact).toBeDefined();
      expect(phoneContact!.value).toBe('090-1234-5678');

      testPersonIds.push(person.id);
    });

    it('ContactAddressから正しいPersonを特定できる', async () => {
      // Arrange
      const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const person = await personInteractor.createPerson({
        name: `Address Link Person ${uniqueSuffix}`,
        contactValue: `link${uniqueSuffix}@example.com`,
      });
      const contactId = person.contacts![0].id;

      // Act
      const dbContact = await prisma.contactAddress.findUnique({
        where: { id: contactId },
        include: { person: true },
      });

      // Assert
      expect(dbContact).toBeDefined();
      expect(dbContact!.person).toBeDefined();
      expect(dbContact!.person!.id).toBe(person.id);
      expect(dbContact!.person!.name).toBe(person.name);

      testPersonIds.push(person.id);
    });
  });

  describe('Principal and Account Relationship Integration', () => {
    it('PrincipalとAccountを含めてPersonを取得できる', async () => {
      // Arrange
      const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const admin = await personInteractor.createAdmin({
        name: `Full Data Admin ${uniqueSuffix}`,
        contactValue: `fulldata${uniqueSuffix}@example.com`,
        contactType: ContactType.EMAIL,
      });

      // Act
      const result = await personInteractor.find(admin.id, {
        principal: { include: { account: true } },
      });

      // Assert
      expect(result).toBeDefined();
      expect(result!.principal).toBeDefined();
      expect(result!.principal!.kind).toBe(PrincipalKind.ADMIN);
      expect(result!.principal!.account).toBeDefined();
      expect(result!.principal!.account!.username).toBe(
        admin.contacts![0].value,
      );
      expect(result!.principal!.account!.isActive).toBe(true);

      testPersonIds.push(admin.id);
      testPrincipalIds.push(result!.principal!.id);
      testAccountIds.push(result!.principal!.account!.id);
    });

    it('AccountからPrincipalを辿ってPersonを特定できる', async () => {
      // Arrange
      const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const admin = await personInteractor.createAdmin({
        name: `Trace Back Admin ${uniqueSuffix}`,
        contactValue: `traceback${uniqueSuffix}@example.com`,
        contactType: ContactType.EMAIL,
      });

      // PrincipalとAccountを含めて再取得
      const fullAdmin = await personInteractor.find(admin.id, {
        principal: { include: { account: true } },
      });
      const accountId = fullAdmin!.principal!.account!.id;

      // Act
      const dbAccount = await prisma.account.findUnique({
        where: { id: accountId },
        include: {
          principal: {
            include: { person: true },
          },
        },
      });

      // Assert
      expect(dbAccount).toBeDefined();
      expect(dbAccount!.principal).toBeDefined();
      expect(dbAccount!.principal!.person).toBeDefined();
      expect(dbAccount!.principal!.person.id).toBe(admin.id);
      expect(dbAccount!.principal!.person.name).toBe(admin.name);

      testPersonIds.push(admin.id);
      testPrincipalIds.push(admin.principal!.id);
      testAccountIds.push(accountId);
    });
  });
});
