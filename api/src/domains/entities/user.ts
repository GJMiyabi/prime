import { Id } from '../value-object/id';
export type UserProps = {
  id: Id;
  email: string;
  name: string;
  password: string;
};

export class User {
  readonly id: Id;
  readonly email: string;
  readonly name: string;
  readonly password: string;
  constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.name = props.name;
    this.password = props.password;
  }

  getEmail(): string {
    return this.email;
  }

  getName(): string {
    return this.name;
  }

  getPasswordHash(): string {
    return this.password;
  }
}
