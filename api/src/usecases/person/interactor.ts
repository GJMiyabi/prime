import { Injectable } from '@nestjs/common';
import {
  IPersonInputPort,
  AdminPersonCreateDto,
  PersonOutputDto,
  SinglePersonAndContact,
  SinglePersonAndContactOutput,
  ContactAddressDTO,
  PrincipalDTO,
  FacilityDTO,
  OrganizationDTO,
} from './input-port';
import {
  IPersonCommandRepository,
  IPersonQueryRepository,
} from 'src/domains/repositories/person.repositories';
import { IPrincipalCommandRepository } from 'src/domains/repositories/principal.repositories';
import { IAccountCommandRepository } from 'src/domains/repositories/account.repositories';
import { IContactAddressCommandRepository } from 'src/domains/repositories/contract-address.repositories';

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
    private readonly principalCommandRepository: IPrincipalCommandRepository,
    private readonly accountCommandRepository: IAccountCommandRepository,
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
  ): Promise<SinglePersonAndContactOutput> {
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
      id: newPerson.id.value,
      name: newPerson.getName(),
      value: newAddress.getValue(),
    };
  }

  async find(
    id: string,
    include?: {
      contacts?: boolean;
      principal?: { include?: { account?: boolean } };
      facilities?: boolean;
      organization?: boolean;
    },
  ): Promise<PersonOutputDto | undefined> {
    const person = await this.personQueryRepository.find(new Id(id), include);
    if (!person) return undefined;

    const contactsDto: ContactAddressDTO[] | null | undefined =
      include?.contacts
        ? person.getContacts().map((c) => ({
            id: c.getId(),
            type: c.getType(),
            value: c.getValue(),
          }))
        : null;

    let principalDto: PrincipalDTO | null | undefined = null;
    if (include?.principal) {
      const p = person.getPrincipal();
      if (p) {
        principalDto = {
          id: p.getId(),
          kind: p.getKind(),
          ...(include.principal.include?.account && p.getAccount()
            ? {
                account: {
                  id: p.getAccount()!.getId(),
                  username: p.getAccount()!.getUsername(),
                  email: p.getAccount()!.getEmail(),
                  isActive: p.getAccount()!.isEnabled(),
                },
              }
            : { account: null }),
        };
      } else {
        principalDto = null;
      }
    }

    // facilities
    const facilitiesDto: FacilityDTO[] | null | undefined = include?.facilities
      ? (person.getFacilities()?.map((f) => ({
          id: f.getId(),
          name: f.getName(),
        })) ?? [])
      : null;

    // organization
    const organizationDto: OrganizationDTO | null | undefined =
      include?.organization
        ? (() => {
            const org = person.getOrganization();
            return org ? { id: org.getId(), name: org.getName() } : null;
          })()
        : null;

    // 最終 DTO（GraphQLのperson型に合わせたキー名）
    const dto: PersonOutputDto = {
      id: person.id.value,
      name: person.getName(),
      ...(include?.contacts ? { contacts: contactsDto ?? [] } : {}), // 常に配列で返したいなら `?? []`
      ...(include?.principal ? { principal: principalDto } : {}),
      ...(include?.facilities ? { facilities: facilitiesDto ?? [] } : {}),
      ...(include?.organization ? { organization: organizationDto } : {}),
    };

    return dto;
  }

  async delete(id: string): Promise<void> {
    await this.personCommandRepository.delete(new Id(id));
  }
}
