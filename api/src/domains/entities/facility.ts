import { Id } from 'src/domains/value-object/id';

import type { Person } from './person';
import type { ContactAddress } from './contact-address';

export type FacilityProps = {
  id: Id | string;
  name: string;
  idNumber: string; // Prisma: IDNumber
  organizationId?: Id | string | null;
  persons?: Person[];
  contactAddresses?: ContactAddress[];
};

export class Facility {
  public readonly id: Id;
  private name: string;
  private idNumber: string;
  private organizationId?: Id;
  private persons: Person[];
  private contactAddresses: ContactAddress[];

  constructor(props: FacilityProps) {
    this.id = props.id instanceof Id ? props.id : new Id(props.id);
    this.name = props.name;
    this.idNumber = props.idNumber;

    if (props.organizationId) {
      this.organizationId =
        props.organizationId instanceof Id
          ? props.organizationId
          : new Id(props.organizationId);
    }

    this.persons = props.persons ?? [];
    this.contactAddresses = props.contactAddresses ?? [];
  }

  // ---- getters ----
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

  getOrganizationId(): string | undefined {
    return this.organizationId?.value;
  }

  getOrganizationIdVO(): Id | undefined {
    return this.organizationId;
  }

  getPersons(): Person[] {
    return this.persons;
  }

  getContactAddresses(): ContactAddress[] {
    return this.contactAddresses;
  }

  // ---- setters / mutators ----
  rename(name: string): void {
    this.name = name;
  }

  setIDNumber(idNumber: string): void {
    this.idNumber = idNumber;
  }

  setOrganizationId(orgId: Id | string | null): void {
    if (!orgId) {
      this.organizationId = undefined;
      return;
    }
    this.organizationId = orgId instanceof Id ? orgId : new Id(orgId);
  }

  attachPersons(persons: Person[]): void {
    this.persons = persons;
  }

  attachContactAddresses(contacts: ContactAddress[]): void {
    this.contactAddresses = contacts;
  }
}
