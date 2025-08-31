"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    id;
    email;
    name;
    password;
    constructor(props) {
        this.id = props.id;
        this.email = props.email;
        this.name = props.name;
        this.password = props.password;
    }
    getEmail() {
        return this.email;
    }
    getName() {
        return this.name;
    }
    getPasswordHash() {
        return this.password;
    }
}
exports.User = User;
//# sourceMappingURL=user.js.map