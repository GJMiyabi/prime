export declare const environment: string;
export declare function getEnvironmentVariableAllowUndefined<T = string>(name: string, defaultValue?: T): T | undefined;
export declare function getEnvironmentVariable<T = string>(name: string, defaultValue?: T): T;
