"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrincipalKind = exports.ContactType = void 0;
var ContactType;
(function (ContactType) {
    ContactType["Address"] = "ADDRESS";
    ContactType["Email"] = "EMAIL";
    ContactType["Phone"] = "PHONE";
})(ContactType || (exports.ContactType = ContactType = {}));
var PrincipalKind;
(function (PrincipalKind) {
    PrincipalKind["Admin"] = "ADMIN";
    PrincipalKind["Stakeholder"] = "STAKEHOLDER";
    PrincipalKind["Student"] = "STUDENT";
    PrincipalKind["Teacher"] = "TEACHER";
})(PrincipalKind || (exports.PrincipalKind = PrincipalKind = {}));
//# sourceMappingURL=types.js.map