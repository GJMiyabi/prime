export declare abstract class ValueObject<T> {
    readonly value: T;
    constructor(value: T);
    protected abstract throwIfInvalid(value: T): void;
    equals(vo: ValueObject<T>): boolean;
}
