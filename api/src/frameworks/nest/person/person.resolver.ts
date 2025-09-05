import { Mutation, Resolver, Args, Query } from '@nestjs/graphql';
import {
  IPersonInputPort,
  AdminPersonCreateDto,
} from 'src/usecases/person/input-port';

@Resolver()
export class PersonMutationResolver {
  constructor(private readonly personInputport: IPersonInputPort) {}

  @Mutation('saveAdminPeron')
  async saveAdminUser(@Args('input') input: AdminPersonCreateDto) {
    const admin = await this.personInputport.createAdmin(input);

    return {
      __type: 'AdminPeron',
      ...admin,
    };
  }
}

@Resolver()
export class PersonQueryResolver {
  constructor(private readonly personInputPort: IPersonInputPort) {}

  @Query(() => Object, { name: 'person' })
  async findPerson(@Args('id') id: string) {
    const person = await this.personInputPort.find(id);
    return {
      __type: 'Person',
      ...person,
    };
  }
}
