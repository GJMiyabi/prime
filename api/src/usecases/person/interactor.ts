import { Injectable } from '@nestjs/common';
import {
  IPersonInputPort,
  AdminPersonCreateDto,
  PersonCreateDto,
  PersonOutputDto,
  PersonIncludeOptions,
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

  async createAdmin(input: AdminPersonCreateDto): Promise<PersonOutputDto> {
    try {
      const person = new Person({
        id: new Id(),
        name: input.name,
      });

      const address = new ContactAddress({
        id: new Id(),
        type: input.contactType,
        personId: new Id(person.id.value),
        value: input.contactValue,
      });

      const principal = new Principal({
        id: new Id(),
        personId: new Id(person.id.value),
        kind: PrincipalKind.ADMIN,
      });

      // TODO: Implement proper password generation/hashing
      const account = new Account({
        id: new Id(),
        password: this.generateTemporaryPassword(),
        username: address.getValue(),
        principalId: new Id(principal.getId()),
      });

      // Transaction should be handled here
      const newPerson = await this.personCommandRepository.create(person);
      const newAddress =
        await this.contactAddressCommandRepository.create(address);
      await this.principalCommandRepository.create(principal);
      await this.accountCommandRepository.create(account);

      return this.mapPersonToDto(newPerson, {
        contacts: [newAddress],
        principal: principal,
        account: account,
      });
    } catch (error) {
      throw new Error(
        `Failed to create admin: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async createPerson(input: PersonCreateDto): Promise<PersonOutputDto> {
    try {
      const person = new Person({
        id: new Id(),
        name: input.name,
      });

      const address = new ContactAddress({
        id: new Id(),
        type: input.contactType || ContactType.EMAIL,
        personId: new Id(person.id.value),
        value: input.contactValue,
      });

      const newPerson = await this.personCommandRepository.create(person);
      const newAddress =
        await this.contactAddressCommandRepository.create(address);

      return this.mapPersonToDto(newPerson, {
        contacts: [newAddress],
      });
    } catch (error) {
      throw new Error(
        `Failed to create person: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async find(
    id: string,
    include?: PersonIncludeOptions,
  ): Promise<PersonOutputDto | undefined> {
    try {
      const person = await this.personQueryRepository.find(new Id(id), include);
      if (!person) return undefined;

      return this.mapPersonToDto(person, {
        includeContacts: include?.contacts,
        includePrincipal: include?.principal,
        includeFacilities: include?.facilities,
        includeOrganization: include?.organization,
      });
    } catch (error) {
      throw new Error(
        `Failed to find person: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.personCommandRepository.delete(new Id(id));
    } catch (error) {
      throw new Error(
        `Failed to delete person: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  // Private helper methods
  private generateTemporaryPassword(): string {
    // TODO: Implement secure password generation
    return 'temp_' + Math.random().toString(36).substring(2, 15);
  }

  private mapPersonToDto(
    person: Person,
    options: {
      contacts?: ContactAddress[];
      principal?: Principal;
      account?: Account;
      includeContacts?: boolean;
      includePrincipal?: { include?: { account?: boolean } };
      includeFacilities?: boolean;
      includeOrganization?: boolean;
    } = {},
  ): PersonOutputDto {
    const dto: PersonOutputDto = {
      id: person.id.value,
      name: person.getName(),
    };

    if (options.contacts || options.includeContacts) {
      const contacts = options.contacts || person.getContacts();
      dto.contacts = contacts.map((c) => ({
        id: c.getId(),
        type: c.getType(),
        value: c.getValue(),
      }));
    }

    if (options.principal || options.includePrincipal) {
      const p = options.principal || person.getPrincipal();
      if (p) {
        dto.principal = {
          id: p.getId(),
          kind: p.getKind(),
          ...(options.includePrincipal?.include?.account && p.getAccount()
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
        dto.principal = null;
      }
    }

    if (options.includeFacilities) {
      const facilities = person.getFacilities();
      dto.facilities =
        facilities?.map((f) => ({
          id: f.getId(),
          name: f.getName(),
        })) ?? [];
    }

    if (options.includeOrganization) {
      const org = person.getOrganization();
      dto.organization = org ? { id: org.getId(), name: org.getName() } : null;
    }

    return dto;
  }
}
