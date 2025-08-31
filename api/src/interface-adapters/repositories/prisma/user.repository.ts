import { User as PrismaUser } from '@prisma/client';
import { User } from 'src/domains/entities/user';
import { Id } from 'src/domains/value-object/id';
import {
  IUserCommandRepository,
  IUserQueryRepository,
} from 'src/domains/repositories/user.repositories';
import { PrismaClientSingleton } from 'src/interface-adapters/shared/prisma-client';

function prismaToUser(prisma: PrismaUser) {
  return new User({
    id: new Id(prisma.id),
    email: prisma.email,
    name: prisma.name,
    password: prisma.password,
  });
}

export class UserCommandRepository implements IUserCommandRepository {
  constructor(private readonly prisma = PrismaClientSingleton.instance) {}

  async save(user: User): Promise<User> {
    const newuser = await this.prisma.user.create({
      data: {
        id: user.id.value,
        name: user.getName(),
        email: user.getEmail(),
        password: user.getPasswordHash(),
        createdAt: new Date(),
      },
    });

    return prismaToUser(newuser);
  }
}

export class UserQueryRepository implements IUserQueryRepository {
  constructor(private readonly prisma = PrismaClientSingleton.instance) {}

  async list(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    return users.map(prismaToUser);
  }

  async find(id: Id): Promise<User | undefined> {
    const user = await this.prisma.user.findUnique({ where: { id: id.value } });
    if (user) {
      return prismaToUser(user);
    }
    return undefined;
  }
}
