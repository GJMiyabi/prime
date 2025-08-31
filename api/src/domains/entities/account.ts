import { Id } from '../value-object/id';

export type AccountProps = {
  id?: Id;
  principalId: Id;
  username: string;
  password: string; // hashed password
  isActive?: boolean;
};

export class Account {
  readonly id: Id;
  readonly principalId: Id;
  readonly username: string;
  readonly password: string;
  readonly isActive: boolean;

  constructor(props: AccountProps) {
    this.id = props.id ?? new Id();
    this.principalId = props.principalId;
    this.username = props.username;
    this.password = props.password;
    this.isActive = props.isActive ?? true;
  }

  getId(): string {
    return this.id.value;
  }

  getPrincipalId(): string {
    return this.principalId.value;
  }

  getUsername(): string {
    return this.username;
  }

  getPassword(): string {
    return this.password;
  }

  isEnabled(): boolean {
    return this.isActive;
  }
}
