import { ContactType } from '../type/contact';
import { Id } from '../value-object/id';

export type ContactAddressProps = {
  id?: Id;
  personId?: Id;
  organizationId?: Id;
  facilityId?: Id;
  value: string;
  type: ContactType;
};

export class ContactAddress {
  readonly id: Id;
  readonly personId?: Id;
  readonly organizationId?: Id;
  readonly facilityId?: Id;
  readonly value: string;
  readonly type: ContactType;

  constructor(props: ContactAddressProps) {
    this.id = props.id ?? new Id();
    this.personId = props.personId;
    this.organizationId = props.organizationId;
    this.facilityId = props.facilityId;
    this.value = props.value;
    this.type = props.type;
  }

  getId(): string {
    return this.id.value;
  }

  getPersonId(): string | undefined {
    return this.personId?.value;
  }

  getOrganizationId(): string | undefined {
    return this.organizationId?.value;
  }

  getFacilityId(): string | undefined {
    return this.facilityId?.value;
  }

  getValue(): string {
    return this.value;
  }

  getType(): ContactType {
    return this.type;
  }
}
