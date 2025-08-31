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
    if (!isCuid(value)) {
      console.log(`INVALID ERROR`);
    }
  }
}
