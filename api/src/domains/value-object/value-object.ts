export abstract class ValueObject<T> {
  constructor(readonly value: T) {
    this.throwIfInvalid(value);
  }

  protected abstract throwIfInvalid(value: T): void;

  equals(vo: ValueObject<T>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    return this.value == vo.value;
  }
}
