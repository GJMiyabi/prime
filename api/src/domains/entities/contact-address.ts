import { ContactType } from '../type/contact';
import { Id } from '../value-object/id';

export type ContactAddressProps = {
  id?: Id;
  personId: Id;
  value: string;
  type: ContactType;
};

export class ContactAddress {
  readonly id: Id;
  readonly personId: Id;
  readonly value: string;
  readonly type: ContactType;

  constructor(props: ContactAddressProps) {
    this.id = props.id ?? new Id();
    this.personId = props.personId;
    this.value = props.value;
    this.type = props.type;
  }

  getId(): string {
    return this.id.value;
  }

  getPersonId(): string {
    return this.personId.value;
  }

  getValue(): string {
    return this.value;
  }

  getType(): ContactType {
    return this.type;
  }
}
