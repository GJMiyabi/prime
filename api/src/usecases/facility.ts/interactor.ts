import { Injectable } from '@nestjs/common';
import {
  IFacilityInputPort,
  FacilityCreateDto,
  FacilityOutputDto,
} from './input-port';
import { IFacilityCommandRepository } from 'src/domains/repositories/facility.repositories';
import { IContactAddressCommandRepository } from 'src/domains/repositories/contract-address.repositories';
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
    private readonly contactAddressCommandRepository: IContactAddressCommandRepository,
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
}
