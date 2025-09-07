import { Facility } from '../entities/facility';
import { Id } from '../value-object/id';

export abstract class IFacilityCommandRepository {
  abstract create(facility: Facility): Promise<Facility>;
  abstract delete(id: Id): Promise<void>;
}

export abstract class IFacilityQueryRepository {
  abstract find(
    id: Id,
    include?: {
      contactAddress?: boolean;
      persons?: boolean;
      organization?: boolean;
    },
  ): Promise<Facility | undefined>;
  abstract list(): Promise<Facility[]>;
}
