import { Id } from '../value-object/id';
import { ContactAddress } from './contact-address';

type PersonProps = {
  id: Id;
  name: string;
  contacts?: ContactAddress[];
  principalId?: string;
};

export class Person {
  readonly id: Id;
  readonly name: string;
  readonly contacts: ContactAddress[];
  readonly principalId?: string;

  constructor(props: PersonProps) {
    this.id = props.id;
    this.name = props.name;
    this.contacts = props.contacts ?? [];
    this.principalId = props.principalId;
  }

  getName(): string {
    return this.name;
  }
}
