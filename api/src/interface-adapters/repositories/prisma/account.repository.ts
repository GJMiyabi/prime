import * as argon2 from 'argon2';
import { Account as Prisma } from '@prisma/client';
import { Account } from 'src/domains/entities/account';
import { Id } from 'src/domains/value-object/id';

import {
  IAccountQueryRepository,
  IAccountCommandRepository,
} from 'src/domains/repositories/account.repositories';
import { PrismaClientSingleton } from 'src/interface-adapters/shared/prisma-client';

function prismToAccount(prisma: Prisma) {
  return new Account({
    id: new Id(prisma.id),
    password: prisma.password,
    principalId: new Id(prisma.principalId),
    isActive: prisma.isActive,
    username: prisma.username,
  });
}

export class AccountCommandRepository implements IAccountCommandRepository {
  constructor(private readonly prisma = PrismaClientSingleton.instance) {}
  async create(data: Account): Promise<Account> {
    const passwordHash = await argon2.hash(data.getPassword());
    const newData = await this.prisma.account.create({
      data: {
        id: data.getId(),
        password: passwordHash,
        principalId: data.getPrincipalId(),
        username: data.getUsername(),
        isActive: true,
      },
    });

    return prismToAccount(newData);
  }

  async update(data: Account): Promise<Account> {
    const passwordHash = await argon2.hash(data.getPassword());
    const updated = await this.prisma.account.update({
      where: { id: data.getId() },
      data: {
        password: passwordHash,
        username: data.getUsername(),
        principalId: data.getPrincipalId(),
        isActive: data.getIsActive(),
      },
    });
    return prismToAccount(updated);
  }

  async delete(principalId: Id): Promise<void> {
    await this.prisma.account.delete({
      where: { principalId: principalId.value },
    });
  }
}

export class AccountQueryRepository implements IAccountQueryRepository {
  constructor(private readonly prisma = PrismaClientSingleton.instance) {}

  async findByPrincipalId(principalId: string): Promise<Account | undefined> {
    const row = await this.prisma.account.findUnique({
      where: { principalId },
    });

    return row ? prismToAccount(row) : undefined;
  }

  async findByUsername(username: string): Promise<Account | undefined> {
    const row = await this.prisma.account.findUnique({
      where: { username },
    });

    return row ? prismToAccount(row) : undefined;
  }
}
