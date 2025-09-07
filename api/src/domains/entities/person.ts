import { Id } from '../value-object/id';
import { ContactAddress } from './contact-address';

type PersonProps = {
  id: Id;
  name: string;
  contacts?: ContactAddress[];
  principal?: string;
  facilities?: string[];
  organizationId?: string;
};

export class Person {
  readonly id: Id;
  readonly name: string;
  readonly contacts: ContactAddress[];
  readonly principal?: string;
  readonly facilities: string[];
  readonly organizationId?: string;

  constructor(props: PersonProps) {
    this.id = props.id;
    this.name = props.name;
    this.contacts = props.contacts ?? [];
    this.principal = props.principal;
    this.facilities = props.facilities ?? [];
    this.organizationId = props.organizationId;
  }

  getName(): string {
    return this.name;
  }

  getPrincipal(): string | undefined {
    return this.principal;
  }

  getFacilities(): string[] {
    return this.facilities;
  }

  getOrganizationId(): string | undefined {
    return this.organizationId;
  }
}
