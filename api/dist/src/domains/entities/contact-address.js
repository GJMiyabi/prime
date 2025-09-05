"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactAddress = void 0;
const id_1 = require("../value-object/id");
class ContactAddress {
    id;
    personId;
    value;
    type;
    constructor(props) {
        this.id = props.id ?? new id_1.Id();
        this.personId = props.personId;
        this.value = props.value;
        this.type = props.type;
    }
    getId() {
        return this.id.value;
    }
    getPersonId() {
        return this.personId.value;
    }
    getValue() {
        return this.value;
    }
    getType() {
        return this.type;
    }
}
exports.ContactAddress = ContactAddress;
//# sourceMappingURL=contact-address.js.map