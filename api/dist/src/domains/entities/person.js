"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Person = void 0;
class Person {
    id;
    name;
    contacts;
    principalId;
    constructor(props) {
        this.id = props.id;
        this.name = props.name;
        this.contacts = props.contacts ?? [];
        this.principalId = props.principalId;
    }
    getName() {
        return this.name;
    }
}
exports.Person = Person;
//# sourceMappingURL=person.js.map