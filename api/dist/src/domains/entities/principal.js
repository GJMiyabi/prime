"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Principal = void 0;
const id_1 = require("../value-object/id");
class Principal {
    id;
    personId;
    kind;
    accountId;
    constructor(props) {
        this.id = props.id ?? new id_1.Id();
        this.personId = props.personId;
        this.kind = props.kind;
        this.accountId = props.accountId;
    }
    getId() {
        return this.id.value;
    }
    getPersonId() {
        return this.personId.value;
    }
    getKind() {
        return this.kind;
    }
    getAccountId() {
        return this.accountId?.value;
    }
}
exports.Principal = Principal;
//# sourceMappingURL=principal.js.map