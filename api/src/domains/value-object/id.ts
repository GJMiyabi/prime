import { ValueObject } from './value-object';
import { createId, isCuid } from '@paralleldrive/cuid2';

export class Id extends ValueObject<string> {
  constructor(value?: string) {
    if (value === undefined) {
      value = createId();
    }
    super(value);
  }

  protected throwIfInvalid(value: string): void {
    // CUIDまたはUUID形式を受け入れる
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value,
      );

    if (!isCuid(value) && !isUuid) {
      throw new Error(
        `Invalid ID format: ${value}. Expected CUID or UUID format.`,
      );
    }
  }
}
