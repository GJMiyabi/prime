"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationException = exports.AuthenticationException = exports.InternalServerException = exports.NotFoundException = exports.InvalidInputException = exports.ApplicationException = exports.ExceptionCategory = void 0;
var ExceptionCategory;
(function (ExceptionCategory) {
    ExceptionCategory["Authentication"] = "Authentication";
    ExceptionCategory["Authorization"] = "Authorization";
    ExceptionCategory["Domain"] = "Domain";
    ExceptionCategory["ExternalService"] = "ExternalService";
    ExceptionCategory["InternalServer"] = "InternalServer";
    ExceptionCategory["InvalidInput"] = "InvalidInput";
    ExceptionCategory["NotFound"] = "NotFound";
})(ExceptionCategory || (exports.ExceptionCategory = ExceptionCategory = {}));
class ApplicationException extends Error {
    category;
    errorId;
    details;
    originalError;
    constructor(category, errorId, message, details, originalError) {
        super(message);
        this.category = category;
        this.errorId = errorId;
        this.details = details;
        this.originalError = originalError;
        try {
            if (originalError) {
                console.error(`Error ID:${errorId} Category:${category}, Message: ${message}`);
            }
        }
        catch {
        }
    }
}
exports.ApplicationException = ApplicationException;
class InvalidInputException extends ApplicationException {
    constructor(errorId, message, details) {
        super(ExceptionCategory.InvalidInput, errorId, message, details);
    }
}
exports.InvalidInputException = InvalidInputException;
class NotFoundException extends ApplicationException {
    constructor(errorId, message, details) {
        super(ExceptionCategory.NotFound, errorId, message, details);
    }
}
exports.NotFoundException = NotFoundException;
class InternalServerException extends ApplicationException {
    constructor(errorId, message, details) {
        super(ExceptionCategory.InternalServer, errorId, message, details);
    }
}
exports.InternalServerException = InternalServerException;
class AuthenticationException extends ApplicationException {
    constructor(errorId, message, details) {
        super(ExceptionCategory.Authentication, errorId, message, details);
    }
}
exports.AuthenticationException = AuthenticationException;
class AuthorizationException extends ApplicationException {
    constructor(errorId, message, details) {
        super(ExceptionCategory.Authorization, errorId, message, details);
    }
}
exports.AuthorizationException = AuthorizationException;
//# sourceMappingURL=exception.js.map