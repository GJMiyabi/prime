"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Account = void 0;
const id_1 = require("../value-object/id");
class Account {
    id;
    principalId;
    username;
    password;
    isActive;
    provider;
    providerSub;
    email;
    lastLoginAt;
    constructor(props) {
        this.id = props.id ?? new id_1.Id();
        this.principalId = props.principalId;
        this.username = props.username;
        this.password = props.password;
        this.isActive = props.isActive ?? true;
        this.provider = props.provider ?? 'auth0';
        this.providerSub = props.providerSub ?? null;
        this.email = props.email ?? null;
        this.lastLoginAt = props.lastLoginAt ?? null;
    }
    getId() {
        return this.id.value;
    }
    getPrincipalId() {
        return this.principalId.value;
    }
    getUsername() {
        return this.username;
    }
    getPassword() {
        return this.password;
    }
    isEnabled() {
        return this.isActive;
    }
    getProvider() {
        return this.provider;
    }
    getProviderSub() {
        return this.providerSub ?? null;
    }
    getEmail() {
        return this.email ?? null;
    }
    getLastLoginAt() {
        return this.lastLoginAt ?? null;
    }
}
exports.Account = Account;
//# sourceMappingURL=account.js.map