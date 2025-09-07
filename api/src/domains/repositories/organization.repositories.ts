import { Organization } from '../entities/organization';
import { Id } from '../value-object/id';

export abstract class IOrganizationCommandRepository {
  abstract create(organization: Organization): Promise<Organization>;
  abstract delete(id: Id): Promise<void>;
}

export abstract class IOrganizationQueryRepository {
  abstract find(
    id: Id,
    include?: {
      contactAddresses?: boolean;
      persons?: boolean;
      facilities?: boolean;
    },
  ): Promise<Organization | undefined>;
  abstract list(): Promise<Organization[]>;
}
