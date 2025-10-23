import { Injectable } from '@nestjs/common';
import {
  IFacilityInputPort,
  FacilityCreateDto,
  FacilityOutputDto,
  FacilityUpdateResponse,
  FacilityUpdateDto,
  ContactAddressDto,
} from './input-port';
import {
  IFacilityCommandRepository,
  IFacilityQueryRepository,
} from 'src/domains/repositories/facility.repositories';
import {
  IContactAddressCommandRepository,
  IContactAddressQueryRepository,
} from 'src/domains/repositories/contract-address.repositories';
import { IPersonQueryRepository } from 'src/domains/repositories/person.repositories';
import { Id } from 'src/domains/value-object/id';
import { Facility } from 'src/domains/entities/facility';
import { ContactAddress } from 'src/domains/entities/contact-address';
import { ContactType } from 'src/domains/type/contact';
import { Person } from 'src/domains/entities/person';

@Injectable()
export class FacilityInteractor implements IFacilityInputPort {
  constructor(
    private readonly facilityCommandRepository: IFacilityCommandRepository,
    private readonly facilityQueryRepository: IFacilityQueryRepository,
    private readonly contactAddressCommandRepository: IContactAddressCommandRepository,
    private readonly contactAddressQueryRepository: IContactAddressQueryRepository,
    private readonly personQueryRepository: IPersonQueryRepository,
  ) {}

  async create(input: FacilityCreateDto): Promise<FacilityOutputDto> {
    try {
      const persons: Person[] = [];
      if (input.personId) {
        const person = await this.personQueryRepository.find(
          new Id(input.personId),
        );
        if (person) {
          persons.push(person);
        }
      }

      const facilityId = new Id();
      const facility = new Facility({
        id: facilityId,
        name: input.name,
        idNumber: input.idNumber,
        persons,
      });

      const newFacility = await this.facilityCommandRepository.create(facility);

      const address = new ContactAddress({
        id: new Id(),
        value: input.contactValue,
        type: input.contactType || ContactType.EMAIL,
        facilityId: facilityId,
      });

      const newAddress =
        await this.contactAddressCommandRepository.create(address);

      return this.mapFacilityToDto(newFacility, [newAddress]);
    } catch (error) {
      throw new Error(
        `Failed to create facility: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async update(input: FacilityUpdateDto): Promise<FacilityUpdateResponse> {
    try {
      const exist = await this.facilityQueryRepository.find(new Id(input.id));
      if (!exist) {
        return {
          result: false,
          message: '該当するデータがありません',
        };
      }

      const name = input.name ?? exist.getName();
      const idNumber = input.idNumber ?? exist.getIDNumber();
      const organizationId = input.organizationId ?? exist.getOrganizationId();

      const persons = await this.getPersonsForUpdate(input.persons, exist);
      const contactAddresses = await this.updateContactAddresses(
        input.contactAddresses,
        exist,
      );

      const updatedFacility = new Facility({
        id: new Id(exist.id.value),
        name: name,
        idNumber: idNumber,
        organizationId: organizationId,
        persons: persons,
        contactAddresses,
      });

      const result =
        await this.facilityCommandRepository.update(updatedFacility);

      return {
        result: true,
        message: '更新成功',
        data: this.mapFacilityToDto(result, contactAddresses),
      };
    } catch (error) {
      return {
        result: false,
        message: `更新エラー: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  // Private helper methods
  private async getPersonsForUpdate(
    personIds: string[] | undefined,
    existingFacility: Facility,
  ): Promise<Person[]> {
    if (!personIds || personIds.length === 0) {
      return existingFacility.getPersons();
    }

    const personPromises = personIds.map((pid) =>
      this.personQueryRepository.find(new Id(pid)),
    );
    const foundPersons = await Promise.all(personPromises);
    return foundPersons.filter((p): p is Person => p !== undefined);
  }

  private async updateContactAddresses(
    inputAddresses: ContactAddressDto[] | undefined,
    existingFacility: Facility,
  ): Promise<ContactAddress[]> {
    if (!inputAddresses || inputAddresses.length === 0) {
      return existingFacility.getContactAddresses();
    }

    // Delete addresses not in input
    const inputIdSet = new Set(
      inputAddresses.filter((ca) => !!ca.id).map((ca) => ca.id as string),
    );

    const existingAddresses = existingFacility.getContactAddresses();
    const addressesToDelete = existingAddresses.filter((addr) => {
      const addrId = addr.id?.value;
      return addrId && !inputIdSet.has(addrId);
    });

    const deletePromises = addressesToDelete.map((addr) =>
      this.contactAddressCommandRepository.delete(addr.id),
    );

    await Promise.all(deletePromises);

    // Update or create addresses
    const updatedAddresses: ContactAddress[] = [];
    for (const ca of inputAddresses) {
      if (ca.id) {
        const existingCA = await this.contactAddressQueryRepository.find(
          new Id(ca.id),
        );
        if (existingCA) {
          updatedAddresses.push(existingCA);
        }
      } else {
        const newCA = new ContactAddress({
          id: new Id(),
          value: ca.value,
          type: ca.type,
          facilityId: existingFacility.getIdVO(),
        });
        const saved = await this.contactAddressCommandRepository.create(newCA);
        updatedAddresses.push(saved);
      }
    }

    return updatedAddresses;
  }

  private mapFacilityToDto(
    facility: Facility,
    contactAddresses?: ContactAddress[],
  ): FacilityOutputDto {
    const addresses = contactAddresses || facility.getContactAddresses();

    return {
      id: facility.getId(),
      name: facility.getName(),
      idNumber: facility.getIDNumber(),
      contactAddresses: addresses.map((addr) => ({
        id: addr.getId(),
        value: addr.getValue(),
        type: addr.getType(),
      })),
      persons: facility.getPersons().map((p) => p.id.value),
      organizationId: facility.getOrganizationId(),
    };
  }
}
