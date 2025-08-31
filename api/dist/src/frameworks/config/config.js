"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.environment = void 0;
exports.getEnvironmentVariableAllowUndefined = getEnvironmentVariableAllowUndefined;
exports.getEnvironmentVariable = getEnvironmentVariable;
const exception_1 = require("../../shared/exception");
function detectEnv() {
    const nodeEnv = process.env.NODE_ENV;
    if (nodeEnv != undefined) {
        return nodeEnv;
    }
    return 'local';
}
exports.environment = detectEnv();
class EnvironmentVariableException extends exception_1.ApplicationException {
    constructor(errorId, message, originalError) {
        super(exception_1.ExceptionCategory.InternalServer, errorId, message, undefined, originalError);
    }
}
function getEnvironmentVariableAllowUndefined(name, defaultValue) {
    const value = process.env[name];
    if (value === undefined) {
        return defaultValue;
    }
    try {
        if (value === 'true' || value === 'false') {
            return (value === 'true');
        }
        const numberValue = Number(value);
        if (value !== '' && !Number.isNaN(numberValue)) {
            return numberValue;
        }
        return value;
    }
    catch (error) {
        throw new EnvironmentVariableException('ENVIRONMENT_VARIABLE_FAIL_TO_CAST', `Failed to cast the ENVIRONMENT variable ${name}`, error);
    }
}
function getEnvironmentVariable(name, defaultValue) {
    const value = getEnvironmentVariableAllowUndefined(name, defaultValue);
    if (value !== undefined) {
        return value;
    }
    else {
        throw new EnvironmentVariableException('ENVIRONMENT_VARIABLE_NOT_DEFINED', `Environment variable ${name} is not defined`);
    }
}
//# sourceMappingURL=config.js.map