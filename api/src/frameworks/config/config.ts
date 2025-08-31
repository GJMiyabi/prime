import { ApplicationException, ExceptionCategory } from 'src/shared/exception';

function detectEnv(): string {
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv != undefined) {
    return nodeEnv;
  }
  return 'local';
}

export const environment = detectEnv();

class EnvironmentVariableException extends ApplicationException {
  constructor(errorId: string, message: string, originalError?: unknown) {
    super(
      ExceptionCategory.InternalServer,
      errorId,
      message,
      undefined,
      originalError,
    );
  }
}

export function getEnvironmentVariableAllowUndefined<T = string>(
  name: string,
  defaultValue?: T,
): T | undefined {
  const value = process.env[name];
  if (value === undefined) {
    return defaultValue;
  }
  try {
    if (value === 'true' || value === 'false') {
      return (value === 'true') as unknown as T;
    }
    const numberValue = Number(value);

    if (value !== '' && !Number.isNaN(numberValue)) {
      return numberValue as unknown as T;
    }

    return value as unknown as T;
  } catch (error) {
    throw new EnvironmentVariableException(
      'ENVIRONMENT_VARIABLE_FAIL_TO_CAST',
      `Failed to cast the ENVIRONMENT variable ${name}`,
      error,
    );
  }
}

export function getEnvironmentVariable<T = string>(
  name: string,
  defaultValue?: T,
): T {
  const value = getEnvironmentVariableAllowUndefined<T>(name, defaultValue);
  if (value !== undefined) {
    return value;
  } else {
    throw new EnvironmentVariableException(
      'ENVIRONMENT_VARIABLE_NOT_DEFINED',
      `Environment variable ${name} is not defined`,
    );
  }
}
