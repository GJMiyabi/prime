import { Id } from '../value-object/id';

export type AccountProps = {
  id?: Id;
  principalId: Id;
  username: string;
  password: string;
  isActive?: boolean;
  provider?: string;
  providerSub?: string | null;
  email?: string | null;
  lastLoginAt?: Date | null;
};

export class Account {
  readonly id: Id;
  readonly principalId: Id;
  readonly username: string;
  readonly password: string;
  readonly isActive: boolean;
  readonly provider: string;
  readonly providerSub?: string | null;
  readonly email?: string | null;
  readonly lastLoginAt?: Date | null;

  constructor(props: AccountProps) {
    this.id = props.id ?? new Id();
    this.principalId = props.principalId;
    this.username = props.username;
    this.password = props.password;
    this.isActive = props.isActive ?? true;
    this.provider = props.provider ?? 'auth0';
    this.providerSub = props.providerSub ?? null;
    this.email = props.email ?? null;
    this.lastLoginAt = props.lastLoginAt ?? null;
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

  getProvider(): string {
    return this.provider;
  }

  getProviderSub(): string | null | undefined {
    return this.providerSub ?? null;
  }

  getEmail(): string | null | undefined {
    return this.email ?? null;
  }

  getLastLoginAt(): Date | null | undefined {
    return this.lastLoginAt ?? null;
  }
}
