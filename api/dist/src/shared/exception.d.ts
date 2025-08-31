export declare enum ExceptionCategory {
    Authentication = "Authentication",
    Authorization = "Authorization",
    Domain = "Domain",
    ExternalService = "ExternalService",
    InternalServer = "InternalServer",
    InvalidInput = "InvalidInput",
    NotFound = "NotFound"
}
export declare abstract class ApplicationException extends Error {
    readonly category: ExceptionCategory;
    readonly errorId: string;
    readonly details?: string | undefined;
    readonly originalError?: unknown | undefined;
    constructor(category: ExceptionCategory, errorId: string, message: string, details?: string | undefined, originalError?: unknown | undefined);
}
export declare class InvalidInputException extends ApplicationException {
    constructor(errorId: string, message: string, details?: string);
}
export declare class NotFoundException extends ApplicationException {
    constructor(errorId: string, message: string, details?: string);
}
export declare class InternalServerException extends ApplicationException {
    constructor(errorId: string, message: string, details?: string);
}
export declare class AuthenticationException extends ApplicationException {
    constructor(errorId: string, message: string, details?: string);
}
export declare class AuthorizationException extends ApplicationException {
    constructor(errorId: string, message: string, details?: string);
}
