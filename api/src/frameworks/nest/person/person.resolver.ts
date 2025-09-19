import { Mutation, Resolver, Args, Query } from '@nestjs/graphql';
import {
  IPersonInputPort,
  AdminPersonCreateDto,
  SinglePersonAndContact,
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

  @Mutation('createSinglePerson')
  async createSinglePerson(@Args('input') input: SinglePersonAndContact) {
    const person = await this.personInputport.createPrson(input);

    return {
      __type: 'SinglePeron',
      ...person,
    };
  }

  @Mutation('deletePerson')
  async deletePerson(@Args('id') id: string): Promise<boolean> {
    await this.personInputport.delete(id);
    return true;
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
