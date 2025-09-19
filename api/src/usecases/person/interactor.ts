import { Injectable } from '@nestjs/common';
import {
  IPersonInputPort,
  AdminPersonCreateDto,
  PersonOutputDto,
  SinglePersonAndContact,
} from './input-port';
import {
  IPersonCommandRepository,
  IPersonQueryRepository,
} from 'src/domains/repositories/person.repositories';
import {
  IPrincipalQueryRepository,
  IPrincipalCommandRepository,
} from 'src/domains/repositories/principal.repositories';
import {
  IAccountQueryRepository,
  IAccountCommandRepository,
} from 'src/domains/repositories/account.repositories';
import {
  IContactAddressQueryRepository,
  IContactAddressCommandRepository,
} from 'src/domains/repositories/contract-address.repositories';
import { Id } from 'src/domains/value-object/id';
import { Person } from 'src/domains/entities/person';
import { Account } from 'src/domains/entities/account';
import { ContactAddress } from 'src/domains/entities/contact-address';
import { Principal } from 'src/domains/entities/principal';
import { PrincipalKind } from 'src/domains/type/principal-kind';
import { ContactType } from 'src/domains/type/contact';

@Injectable()
export class PersonInteractor implements IPersonInputPort {
  constructor(
    private readonly personCommandRepository: IPersonCommandRepository,
    private readonly personQueryRepository: IPersonQueryRepository,
    private readonly principalQueryRepository: IPrincipalQueryRepository,
    private readonly principalCommandRepository: IPrincipalCommandRepository,
    private readonly accountCommandRepository: IAccountCommandRepository,
    private readonly accountQueryRepository: IAccountQueryRepository,
    private readonly contactAddressQueryRepository: IContactAddressQueryRepository,
    private readonly contactAddressCommandRepository: IContactAddressCommandRepository,
  ) {}

  async createAdmin(
    input: AdminPersonCreateDto,
  ): Promise<AdminPersonCreateDto> {
    const person = new Person({
      id: new Id(),
      name: input.name,
    });

    const address = new ContactAddress({
      id: new Id(),
      type: input.type,
      personId: new Id(person.id.value),
      value: input.value,
    });

    const principal = new Principal({
      id: new Id(),
      personId: new Id(person.id.value),
      kind: PrincipalKind.ADMIN,
    });

    const account = new Account({
      id: new Id(),
      password: '',
      username: address.getValue(),
      principalId: new Id(principal.getId()),
    });

    const newPerson = await this.personCommandRepository.create(person);
    const newAddress =
      await this.contactAddressCommandRepository.create(address);
    await this.principalCommandRepository.create(principal);
    await this.accountCommandRepository.create(account);

    return {
      id: newPerson.id.value,
      name: newPerson.getName(),
      value: newAddress.getValue(),
      type: newAddress.getType(),
    };
  }

  async createPrson(
    input: SinglePersonAndContact,
  ): Promise<SinglePersonAndContact> {
    const person = new Person({
      id: new Id(),
      name: input.name,
    });

    const address = new ContactAddress({
      id: new Id(),
      type: ContactType.EMAIL,
      personId: new Id(person.id.value),
      value: input.value,
    });
    const newPerson = await this.personCommandRepository.create(person);
    const newAddress =
      await this.contactAddressCommandRepository.create(address);

    return {
      name: newPerson.getName(),
      value: newAddress.getValue(),
    };
  }

  async find(
    id: string,
    include?: {
      contacts?: boolean;
      principal?: { include?: { account?: boolean } };
      facility?: boolean;
      organization?: boolean;
    },
  ): Promise<PersonOutputDto | undefined> {
    const person = await this.personQueryRepository.find(new Id(id), include);
    if (!person) return undefined;

    let principal: Principal | undefined;
    let account: Account | undefined;
    let address: ContactAddress[] | undefined;

    if (include?.principal) {
      principal = await this.principalQueryRepository.findByPersonId(id);
      if (principal && include.principal.include?.account) {
        account = await this.accountQueryRepository.findByPrincipalId(
          principal.id.value,
        );
      }
    }

    if (include?.contacts) {
      address = await this.contactAddressQueryRepository.findByPersonId(id);
    }

    const result = {
      id: person.id.value,
      name: person.getName(),
      ...(include?.principal ? { principal } : {}),
      ...(include?.principal?.include?.account ? { account } : {}),
      ...(include?.contacts ? { contactAddress: address } : {}),
    } as PersonOutputDto;

    return result;
  }

  async delete(id: string): Promise<void> {
    await this.personCommandRepository.delete(new Id(id));
  }
}
