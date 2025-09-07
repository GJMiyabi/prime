import { Id } from '../value-object/id';
import { Person } from './person';
import { Facility } from './facility';
import { ContactAddress } from './contact-address';

export interface OrganizationProps {
  id: Id;
  name: string;
  idNumber: string;
  persons?: Person[];
  facilities?: Facility[];
  contactAddress?: ContactAddress[];
}

export class Organization {
  private readonly id: Id;
  private name: string;
  private idNumber: string;
  private persons: Person[];
  private facilities: Facility[];
  private contactAddress: ContactAddress[];

  constructor(props: OrganizationProps) {
    this.id = props.id;
    this.name = props.name;
    this.idNumber = props.idNumber;
    this.persons = props.persons ?? [];
    this.facilities = props.facilities ?? [];
    this.contactAddress = props.contactAddress ?? [];
  }

  getId(): string {
    return this.id.value;
  }

  getIdVO(): Id {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getIDNumber(): string {
    return this.idNumber;
  }

  getPersons(): Person[] {
    return this.persons;
  }

  getFacilities(): Facility[] {
    return this.facilities;
  }

  getContactAddresses(): ContactAddress[] {
    return this.contactAddress;
  }

  rename(name: string): void {
    this.name = name;
  }

  setIDNumber(idNumber: string): void {
    this.idNumber = idNumber;
  }

  attachPersons(persons: Person[]): void {
    this.persons = persons;
  }

  attachFacilities(facilities: Facility[]): void {
    this.facilities = facilities;
  }

  attachContactAddress(address: ContactAddress[]): void {
    this.contactAddress = address;
  }
}
