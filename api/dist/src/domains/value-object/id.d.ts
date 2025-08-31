import { ValueObject } from './value-object';
export declare class Id extends ValueObject<string> {
    constructor(value?: string);
    protected throwIfInvalid(value: string): void;
}
