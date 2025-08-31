import { IUserInputPort, UserSaveInputDto } from 'src/usecases/user/input-port';
import { Mutation, Resolver, Args, Query } from '@nestjs/graphql';

@Resolver()
export class UserMutationResolver {
  constructor(private readonly userInputPort: IUserInputPort) {}

  @Mutation('saveUser')
  async saveUser(@Args('input') input: UserSaveInputDto) {
    const user = await this.userInputPort.save(input);

    return {
      __type: 'User',
      ...user,
    };
  }
}

@Resolver()
export class UserQueryResolver {
  constructor(private readonly userInputPort: IUserInputPort) {}

  @Query(() => Object, { name: 'user' })
  async findOne(@Args('input') input: string) {
    const user = await this.userInputPort.findOne(input);
    return {
      __type: 'User',
      ...user,
    };
  }
}
