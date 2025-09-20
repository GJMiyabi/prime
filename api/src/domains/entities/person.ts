import { Id } from '../value-object/id';
import { ContactAddress } from './contact-address';
import { Facility } from './facility';
import { Principal } from './principal';
import { Organization } from './organization';

type PersonProps = {
  id: Id;
  name: string;
  contacts?: ContactAddress[];
  principal?: Principal;
  facilities?: Facility[];
  organization?: Organization;
};

export class Person {
  readonly id: Id;
  readonly name: string;
  readonly contacts: ContactAddress[];
  readonly principal?: Principal;
  readonly facilities?: Facility[];
  readonly organization?: Organization;

  constructor(props: PersonProps) {
    this.id = props.id;
    this.name = props.name;
    this.contacts = props.contacts ?? [];
    this.principal = props.principal;
    this.facilities = props.facilities ?? [];
    this.organization = props.organization;
  }

  getId(): Id {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getContacts(): ContactAddress[] {
    return this.contacts;
  }

  getPrincipal(): Principal | undefined {
    return this.principal;
  }

  getFacilities(): Facility[] | undefined {
    return this.facilities;
  }

  getOrganization(): Organization | undefined {
    return this.organization;
  }
}
