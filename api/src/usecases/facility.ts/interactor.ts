import { Injectable } from '@nestjs/common';
import {
  IFacilityInputPort,
  FacilityCreateDto,
  FacilityOutputDto,
  FacilityUpdateResponse,
  FacilityUpdateDto,
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
    const data = new Facility({
      id: facilityId,
      name: input.name,
      idNumber: input.IDNumber,
      persons,
    });

    const newData = await this.facilityCommandRepository.create(data);
    const address = new ContactAddress({
      id: new Id(),
      value: input.value,
      type: ContactType.EMAIL,
      facilityId: facilityId,
    });
    const newAddress =
      await this.contactAddressCommandRepository.create(address);

    return {
      name: newData.getName(),
      IDNumber: newData.getIDNumber(),
      contactAddress: [newAddress],
    };
  }

  async update(input: FacilityUpdateDto): Promise<FacilityUpdateResponse> {
    const exist = await this.facilityQueryRepository.find(new Id(input.id));
    if (!exist) {
      return {
        result: false,
        message: '該当するデータがありません',
        data: undefined,
      };
    }

    const name = input.name ? input.name : exist.getName();
    const IDNumber = input.IDNumber ? input.IDNumber : exist.getIDNumber();
    const organizationId = input.organizationId
      ? input.organizationId
      : exist.getOrganizationId();

    let persons: Person[] = [];
    if (input.persons && input.persons.length > 0) {
      const personPromises = input.persons.map((pid) =>
        this.personQueryRepository.find(new Id(pid)),
      );
      const foundPersons = await Promise.all(personPromises);
      persons = foundPersons.filter((p): p is Person => p !== undefined);
    } else {
      persons = exist.getPersons();
    }

    let contactAddresses: ContactAddress[] = exist.getContactAddresses();

    if (input.contactAddresses && input.contactAddresses.length > 0) {
      const updatedAddresses: ContactAddress[] = [];
      const inputIdSet = new Set(
        input.contactAddresses
          .filter((ca) => !!ca.id)
          .map((ca) => ca.id as string),
      );
      const existingForDeletion = exist.getContactAddresses();
      for (const ex of existingForDeletion) {
        const exId = ex.id?.value as string | undefined;
        if (exId && !inputIdSet.has(exId)) {
          await this.contactAddressCommandRepository.delete(new Id(exId));
        }
      }

      for (const ca of input.contactAddresses) {
        if (ca.id) {
          const existingCA = await this.contactAddressQueryRepository.find(
            new Id(ca.id),
          );
          if (Array.isArray(existingCA)) {
            updatedAddresses.push(...existingCA);
          } else if (existingCA) {
            updatedAddresses.push(existingCA);
          }
        } else {
          // 新規作成
          const newCA = new ContactAddress({
            id: new Id(),
            value: ca.value,
            type: ca.type,
            facilityId: exist.getIdVO(),
          });
          const saved =
            await this.contactAddressCommandRepository.create(newCA);
          updatedAddresses.push(saved);
        }
      }

      contactAddresses = updatedAddresses;
    }

    const newFacility = new Facility({
      id: new Id(exist.id.value),
      name: name,
      idNumber: IDNumber,
      organizationId: organizationId,
      persons: persons,
      contactAddresses,
    });

    const update = await this.facilityCommandRepository.update(newFacility);

    return {
      result: true,
      message: '更新成功',
      data: {
        id: update.getId(),
        IDNumber: update.getIDNumber(),
        name: update.getName(),
        organizationId: update.getOrganizationId(),
        persons: update.getPersons().map((p) => p.id.value),
        contactAddresses: update.getContactAddresses().map((c) => c.getValue()),
      },
    };
  }
}
