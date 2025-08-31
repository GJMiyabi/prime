import { Id } from '../value-object/id';
import { PrincipalKind } from '../type/principal-kind';

export type PrincipalProps = {
  id?: Id;
  personId: Id;
  kind: PrincipalKind;
  accountId?: Id;
};

export class Principal {
  readonly id: Id;
  readonly personId: Id;
  readonly kind: PrincipalKind;
  readonly accountId?: Id;

  constructor(props: PrincipalProps) {
    this.id = props.id ?? new Id();
    this.personId = props.personId;
    this.kind = props.kind;
    this.accountId = props.accountId;
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

  getAccountId(): string | undefined {
    return this.accountId?.value;
  }
}
