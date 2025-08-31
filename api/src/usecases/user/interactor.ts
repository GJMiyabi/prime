import { Injectable } from '@nestjs/common';
import { UserSaveInputDto, UserOutputDto } from './input-port';
import {
  IUserCommandRepository,
  IUserQueryRepository,
} from 'src/domains/repositories/user.repositories';
import { IUserInputPort } from './input-port';
import { User } from 'src/domains/entities/user';
import { Id } from 'src/domains/value-object/id';
import * as argon2 from 'argon2';

@Injectable()
export class UserInteractor implements IUserInputPort {
  constructor(
    private readonly userCommandRepository: IUserCommandRepository,
    private readonly userQueryRepository: IUserQueryRepository,
  ) {}

  async save(input: UserSaveInputDto): Promise<UserOutputDto> {
    const passwordHash = await argon2.hash(input.password);

    const user = new User({
      id: new Id(),
      name: input.name,
      email: input.email,
      password: passwordHash,
    });

    const newUser = await this.userCommandRepository.save(user);

    return {
      id: newUser.id.value,
      email: newUser.getEmail(),
      name: newUser.getName(),
    };
  }

  async findOne(id: string): Promise<UserOutputDto | undefined> {
    const user = await this.userQueryRepository.find(new Id(id));

    if (user) {
      return {
        id: user.id.value,
        name: user.name,
        email: user.email,
      };
    } else {
      return undefined;
    }
  }
}
