import { Facility } from '../entities/facility';
import { Id } from '../value-object/id';

// Include options for facility queries
export interface FacilityIncludeOptions {
  contactAddress?: boolean;
  persons?: boolean;
  organization?: boolean;
}

// Query filters for facility listing
export interface FacilityQueryFilters {
  organizationId?: Id;
  personIds?: Id[];
  isActive?: boolean;
  name?: string;
}

export abstract class IFacilityCommandRepository {
  abstract create(facility: Facility): Promise<Facility>;
  abstract update(facility: Facility): Promise<Facility>;
  abstract delete(id: Id): Promise<void>;
}

export abstract class IFacilityQueryRepository {
  abstract find(
    id: Id,
    include?: FacilityIncludeOptions,
  ): Promise<Facility | undefined>;

  abstract list(
    filters?: FacilityQueryFilters,
    include?: FacilityIncludeOptions,
  ): Promise<Facility[]>;

  abstract findByOrganization(
    organizationId: Id,
    include?: FacilityIncludeOptions,
  ): Promise<Facility[]>;

  abstract findByPerson(
    personId: Id,
    include?: FacilityIncludeOptions,
  ): Promise<Facility[]>;

  abstract exists(id: Id): Promise<boolean>;
}
