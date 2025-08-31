"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Id = void 0;
const value_object_1 = require("./value-object");
const cuid2_1 = require("@paralleldrive/cuid2");
class Id extends value_object_1.ValueObject {
    constructor(value) {
        if (value === undefined) {
            value = (0, cuid2_1.createId)();
        }
        super(value);
    }
    throwIfInvalid(value) {
        if (!(0, cuid2_1.isCuid)(value)) {
            console.log(`INVALID ERROR`);
        }
    }
}
exports.Id = Id;
//# sourceMappingURL=id.js.map