import { Id } from '../value-object/id';
import { PrincipalKind } from '../type/principal-kind';
import { Account } from './account';

export type PrincipalProps = {
  id?: Id;
  personId: Id;
  kind: PrincipalKind;
  account?: Account;
};

export class Principal {
  readonly id: Id;
  readonly personId: Id;
  readonly kind: PrincipalKind;
  readonly account?: Account;

  constructor(props: PrincipalProps) {
    this.id = props.id ?? new Id();
    this.personId = props.personId;
    this.kind = props.kind;
    this.account = props.account;
  }

  getId(): string {
    return this.id.value;
  }

  getPersonId(): string {
    return this.personId.value;
  }

  getKind(): PrincipalKind {
    return this.kind;
  }

  getAccount(): Account | undefined {
    return this.account;
  }
}
