"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValueObject = void 0;
class ValueObject {
    value;
    constructor(value) {
        this.value = value;
        this.throwIfInvalid(value);
    }
    equals(vo) {
        if (vo === null || vo === undefined) {
            return false;
        }
        return this.value == vo.value;
    }
}
exports.ValueObject = ValueObject;
//# sourceMappingURL=value-object.js.map