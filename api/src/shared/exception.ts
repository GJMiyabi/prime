export enum ExceptionCategory {
  Authentication = 'Authentication',
  Authorization = 'Authorization',
  Domain = 'Domain',
  ExternalService = 'ExternalService',
  InternalServer = 'InternalServer',
  InvalidInput = 'InvalidInput',
  NotFound = 'NotFound',
}

export abstract class ApplicationException extends Error {
  constructor(
    public readonly category: ExceptionCategory,
    public readonly errorId: string,
    message: string,
    public readonly details?: string,
    public readonly originalError?: unknown,
  ) {
    super(message);
    try {
      if (originalError) {
        console.error(
          `Error ID:${errorId} Category:${category}, Message: ${message}`,
        );
      }
    } catch {
      /* ignore logging error */
    }
  }
}

export class InvalidInputException extends ApplicationException {
  constructor(errorId: string, message: string, details?: string) {
    super(ExceptionCategory.InvalidInput, errorId, message, details);
  }
}

export class NotFoundException extends ApplicationException {
  constructor(errorId: string, message: string, details?: string) {
    super(ExceptionCategory.NotFound, errorId, message, details);
  }
}

export class InternalServerException extends ApplicationException {
  constructor(errorId: string, message: string, details?: string) {
    super(ExceptionCategory.InternalServer, errorId, message, details);
  }
}

export class AuthenticationException extends ApplicationException {
  constructor(errorId: string, message: string, details?: string) {
    super(ExceptionCategory.Authentication, errorId, message, details);
  }
}

export class AuthorizationException extends ApplicationException {
  constructor(errorId: string, message: string, details?: string) {
    super(ExceptionCategory.Authorization, errorId, message, details);
  }
}
