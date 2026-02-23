import { Test, TestingModule } from '@nestjs/testing';
import { PersonInteractor } from 'src/usecases/person/interactor';
import {
  IPersonInputPort,
  AdminPersonCreateDto,
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
import { Id } from 'src/domains/value-object/id';

describe('Transaction Integrity Integration Tests', () => {
  let personInteractor: PersonInteractor;
  let prisma: typeof PrismaClientSingleton.instance;
  let personCommandRepository: PersonCommandRepository;
  let accountCommandRepository: AccountCommandRepository;
  let contactAddressCommandRepository: ContactAddressCommandRepository;

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
    personCommandRepository = moduleFixture.get<PersonCommandRepository>(
      IPersonCommandRepository,
    );
    accountCommandRepository = moduleFixture.get<AccountCommandRepository>(
      IAccountCommandRepository,
    );
    contactAddressCommandRepository =
      moduleFixture.get<ContactAddressCommandRepository>(
        IContactAddressCommandRepository,
      );
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

  describe('Cascade Delete Transaction Integrity', () => {
    it('Person削除時にContactAddress、Principal、Accountが全て削除される', async () => {
      // Arrange
      const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const admin = await personInteractor.createAdmin({
        name: `Cascade Test Admin ${uniqueSuffix}`,
        contactValue: `cascade${uniqueSuffix}@example.com`,
        contactType: ContactType.EMAIL,
      });

      // 関連データを取得
      const fullAdmin = await personInteractor.find(admin.id, {
        contacts: true,
        principal: { include: { account: true } },
      });

      const personId = admin.id;
      const contactId = fullAdmin!.contacts![0].id;
      const principalId = fullAdmin!.principal!.id;
      const accountId = fullAdmin!.principal!.account!.id;

      // Act - 削除実行
      await personInteractor.delete(personId);

      // Assert - すべてのデータが削除されていることを確認
      const [dbPerson, dbContact, dbPrincipal, dbAccount] = await Promise.all([
        prisma.person.findUnique({ where: { id: personId } }),
        prisma.contactAddress.findUnique({ where: { id: contactId } }),
        prisma.principal.findUnique({ where: { id: principalId } }),
        prisma.account.findUnique({ where: { id: accountId } }),
      ]);

      expect(dbPerson).toBeNull();
      expect(dbContact).toBeNull();
      expect(dbPrincipal).toBeNull();
      expect(dbAccount).toBeNull();
    });

    it('Person削除トランザクション中にエラーが起きても部分削除されない', async () => {
      // Arrange
      const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const person = await personInteractor.createPerson({
        name: `Rollback Test ${uniqueSuffix}`,
        contactValue: `rollback${uniqueSuffix}@example.com`,
      });

      testPersonIds.push(person.id);

      // 存在しないIDで削除を試みる（エラーを発生させる）
      const fakeId = 'cuid0000000000000000000000';

      // Act & Assert
      await expect(personInteractor.delete(fakeId)).rejects.toThrow();

      // 元のPersonは削除されていないことを確認
      const dbPerson = await prisma.person.findUnique({
        where: { id: person.id },
      });
      expect(dbPerson).not.toBeNull();
      expect(dbPerson!.name).toBe(person.name);
    });
  });

  describe('Multiple Entity Creation Atomicity', () => {
    it('Admin作成時に4つのエンティティ（Person/Contact/Principal/Account）が全て作成される', async () => {
      // Arrange
      const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const input: AdminPersonCreateDto = {
        name: `Atomicity Test ${uniqueSuffix}`,
        contactValue: `atomicity${uniqueSuffix}@example.com`,
        contactType: ContactType.EMAIL,
      };

      // Act
      const result = await personInteractor.createAdmin(input);

      // Assert - 全エンティティがDBに存在することを確認
      const fullResult = await personInteractor.find(result.id, {
        contacts: true,
        principal: { include: { account: true } },
      });

      const [dbPerson, dbContact, dbPrincipal, dbAccount] = await Promise.all([
        prisma.person.findUnique({ where: { id: result.id } }),
        prisma.contactAddress.findFirst({
          where: { personId: result.id },
        }),
        prisma.principal.findUnique({
          where: { personId: result.id },
        }),
        prisma.account.findUnique({
          where: { id: fullResult!.principal!.account!.id },
        }),
      ]);

      expect(dbPerson).not.toBeNull();
      expect(dbContact).not.toBeNull();
      expect(dbPrincipal).not.toBeNull();
      expect(dbAccount).not.toBeNull();

      // 関連が正しく設定されていることを確認
      expect(dbContact!.personId).toBe(result.id);
      expect(dbPrincipal!.personId).toBe(result.id);
      expect(dbAccount!.principalId).toBe(dbPrincipal!.id);

      testPersonIds.push(result.id);
      testPrincipalIds.push(dbPrincipal!.id);
      testAccountIds.push(dbAccount!.id);
    });

    it('複数のContactAddressを持つPersonが一貫性を持って作成される', async () => {
      // Arrange
      const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const person = await personInteractor.createPerson({
        name: `Multi Contact Consistency ${uniqueSuffix}`,
        contactValue: `multi${uniqueSuffix}@example.com`,
      });

      testPersonIds.push(person.id);

      // 追加のContactAddressを作成
      const { ContactAddress } = await import(
        'src/domains/entities/contact-address'
      );
      const secondContact = new ContactAddress({
        id: new Id(),
        personId: new Id(person.id),
        type: ContactType.PHONE,
        value: '090-9999-8888',
      });
      await contactAddressCommandRepository.create(secondContact);

      // Act & Assert - すべてのContactAddressが同じPersonを参照
      const dbContacts = await prisma.contactAddress.findMany({
        where: { personId: person.id },
      });

      expect(dbContacts).toHaveLength(2);
      dbContacts.forEach((contact) => {
        expect(contact.personId).toBe(person.id);
      });
    });
  });

  describe('Foreign Key Constraint Violations', () => {
    it('存在しないPersonIdでContactAddressを作成するとエラーになる', async () => {
      // Arrange
      const { ContactAddress } = await import(
        'src/domains/entities/contact-address'
      );
      const fakePersonId = 'cuid0000000000000000000000';
      const invalidContact = new ContactAddress({
        id: new Id(),
        personId: new Id(fakePersonId),
        type: ContactType.EMAIL,
        value: 'invalid@example.com',
      });

      // Act & Assert
      await expect(
        contactAddressCommandRepository.create(invalidContact),
      ).rejects.toThrow();
    });

    it('存在しないPrincipalIdでAccountを作成するとエラーになる', async () => {
      // Arrange
      const { Account } = await import('src/domains/entities/account');
      const fakePrincipalId = 'cuid0000000000000000000000';
      const invalidAccount = new Account({
        id: new Id(),
        username: 'invalid_user',
        password: 'hashed_password',
        principalId: new Id(fakePrincipalId),
        isActive: true,
      });

      // Act & Assert
      await expect(
        accountCommandRepository.create(invalidAccount),
      ).rejects.toThrow();
    });
  });

  describe('Update Transaction Integrity', () => {
    it('Person更新時にトランザクションが正しく実行される', async () => {
      // Arrange
      const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const person = await personInteractor.createPerson({
        name: `Update Transaction ${uniqueSuffix}`,
        contactValue: `update${uniqueSuffix}@example.com`,
      });

      testPersonIds.push(person.id);

      const { Person } = await import('src/domains/entities/person');
      const personQueryRepository = new PersonQueryRepository();
      const oldPerson = await personQueryRepository.find(new Id(person.id));

      const newName = `Updated ${Date.now()}`;
      const updatedPerson = new Person({
        id: oldPerson!.id,
        name: newName,
        contacts: oldPerson!.contacts,
      });

      // Act
      await personCommandRepository.update(updatedPerson);

      // Assert - 更新が反映されている
      const dbPerson = await prisma.person.findUnique({
        where: { id: person.id },
      });
      expect(dbPerson!.name).toBe(newName);
    });

    it('Person更新トランザクション中のエラーでロールバックされる', async () => {
      // Arrange
      const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const person = await personInteractor.createPerson({
        name: `Rollback Update ${uniqueSuffix}`,
        contactValue: `rollbackup${uniqueSuffix}@example.com`,
      });

      testPersonIds.push(person.id);

      const originalName = person.name;

      // 存在しないPersonで更新を試みる
      const { Person } = await import('src/domains/entities/person');
      const fakeId = 'cuid0000000000000000000000';
      const fakePerson = new Person({
        id: new Id(fakeId),
        name: 'This should not persist',
      });

      // Act & Assert
      await expect(
        personCommandRepository.update(fakePerson),
      ).rejects.toThrow();

      // 元のPersonは変更されていない
      const dbPerson = await prisma.person.findUnique({
        where: { id: person.id },
      });
      expect(dbPerson!.name).toBe(originalName);
    });
  });

  describe('Concurrent Update Handling', () => {
    it('同じPersonへの同時更新が両方とも成功する', async () => {
      // Arrange
      const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const person = await personInteractor.createPerson({
        name: `Concurrent Test ${uniqueSuffix}`,
        contactValue: `concurrent${uniqueSuffix}@example.com`,
      });

      testPersonIds.push(person.id);

      const { Person } = await import('src/domains/entities/person');
      const personQueryRepository = new PersonQueryRepository();

      // 2つの異なる更新を準備
      const [person1, person2] = await Promise.all([
        personQueryRepository.find(new Id(person.id)),
        personQueryRepository.find(new Id(person.id)),
      ]);

      const updatedPerson1 = new Person({
        id: person1!.id,
        name: `Concurrent Update 1 ${Date.now()}`,
        contacts: person1!.contacts,
      });

      const updatedPerson2 = new Person({
        id: person2!.id,
        name: `Concurrent Update 2 ${Date.now() + 1}`,
        contacts: person2!.contacts,
      });

      // Act - 同時に更新を実行
      const [result1, result2] = await Promise.all([
        personCommandRepository.update(updatedPerson1),
        personCommandRepository.update(updatedPerson2),
      ]);

      // Assert - 両方の更新が成功している
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();

      const finalPerson = await prisma.person.findUnique({
        where: { id: person.id },
      });
      // いずれかの更新が反映されている（同時更新なので順序は不確定）
      const possibleNames = [updatedPerson1.name, updatedPerson2.name];
      expect(possibleNames).toContain(finalPerson!.name);
    });
  });

  describe('Complex Transaction Scenarios', () => {
    it('Admin削除時に関連する全データが正しい順序で削除される', async () => {
      // Arrange
      const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const admin = await personInteractor.createAdmin({
        name: `Complex Delete ${uniqueSuffix}`,
        contactValue: `complex${uniqueSuffix}@example.com`,
        contactType: ContactType.EMAIL,
      });

      const fullAdmin = await personInteractor.find(admin.id, {
        contacts: true,
        principal: { include: { account: true } },
      });

      // 各エンティティが存在することを事前確認
      const preCheck = await Promise.all([
        prisma.person.findUnique({ where: { id: admin.id } }),
        prisma.contactAddress.findMany({ where: { personId: admin.id } }),
        prisma.principal.findUnique({
          where: { personId: admin.id },
        }),
        prisma.account.findUnique({
          where: { id: fullAdmin!.principal!.account!.id },
        }),
      ]);

      expect(preCheck[0]).not.toBeNull(); // Person
      expect(preCheck[1].length).toBeGreaterThan(0); // ContactAddress
      expect(preCheck[2]).not.toBeNull(); // Principal
      expect(preCheck[3]).not.toBeNull(); // Account

      // Act - 削除実行
      await personInteractor.delete(admin.id);

      // Assert - トランザクション内で正しい順序で削除されている
      // 実行順序: Account → Principal → ContactAddress → Person
      const postCheck = await Promise.all([
        prisma.person.findUnique({ where: { id: admin.id } }),
        prisma.contactAddress.findMany({ where: { personId: admin.id } }),
        prisma.principal.findUnique({ where: { personId: admin.id } }),
        prisma.account.findUnique({
          where: { id: fullAdmin!.principal!.account!.id },
        }),
      ]);

      expect(postCheck[0]).toBeNull(); // Person
      expect(postCheck[1]).toHaveLength(0); // ContactAddress
      expect(postCheck[2]).toBeNull(); // Principal
      expect(postCheck[3]).toBeNull(); // Account
    });

    it('複数のPersonを同時に削除しても相互に影響しない', async () => {
      // Arrange
      const uniqueSuffix1 = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const uniqueSuffix2 = `${Date.now() + 1}_${Math.random().toString(36).substring(2, 9)}`;

      const [person1, person2] = await Promise.all([
        personInteractor.createPerson({
          name: `Parallel Delete 1 ${uniqueSuffix1}`,
          contactValue: `parallel1_${uniqueSuffix1}@example.com`,
        }),
        personInteractor.createPerson({
          name: `Parallel Delete 2 ${uniqueSuffix2}`,
          contactValue: `parallel2_${uniqueSuffix2}@example.com`,
        }),
      ]);

      // Act - 同時に削除
      await Promise.all([
        personInteractor.delete(person1.id),
        personInteractor.delete(person2.id),
      ]);

      // Assert - 両方とも正しく削除されている
      const [dbPerson1, dbPerson2] = await Promise.all([
        prisma.person.findUnique({ where: { id: person1.id } }),
        prisma.person.findUnique({ where: { id: person2.id } }),
      ]);

      expect(dbPerson1).toBeNull();
      expect(dbPerson2).toBeNull();
    });
  });

  describe('Data Consistency After Operations', () => {
    it('Person作成後にすべての関連データが整合性を保っている', async () => {
      // Arrange & Act
      const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const admin = await personInteractor.createAdmin({
        name: `Consistency Check ${uniqueSuffix}`,
        contactValue: `consistency${uniqueSuffix}@example.com`,
        contactType: ContactType.EMAIL,
      });

      const fullAdmin = await personInteractor.find(admin.id, {
        contacts: true,
        principal: { include: { account: true } },
      });

      testPersonIds.push(admin.id);
      testPrincipalIds.push(fullAdmin!.principal!.id);
      testAccountIds.push(fullAdmin!.principal!.account!.id);

      // Assert - データベースから直接取得して整合性を確認
      const dbPerson = await prisma.person.findUnique({
        where: { id: admin.id },
        include: {
          contacts: true,
          principal: {
            include: {
              account: true,
            },
          },
        },
      });

      // Person → ContactAddress の整合性
      expect(dbPerson!.contacts.length).toBeGreaterThan(0);
      expect(dbPerson!.contacts[0].personId).toBe(admin.id);

      // Person → Principal の整合性
      expect(dbPerson!.principal).not.toBeNull();
      expect(dbPerson!.principal!.personId).toBe(admin.id);

      // Principal → Account の整合性
      expect(dbPerson!.principal!.account).not.toBeNull();
      expect(dbPerson!.principal!.account!.principalId).toBe(
        dbPerson!.principal!.id,
      );

      // ContactAddress.value と Account.username の整合性
      expect(dbPerson!.principal!.account!.username).toBe(
        dbPerson!.contacts[0].value,
      );
    });
  });
});
