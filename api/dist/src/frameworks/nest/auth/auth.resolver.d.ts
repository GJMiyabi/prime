import { AuthService } from './auth.service';
type LoginInput = {
    username: string;
    password: string;
};
export declare class AuthResolver {
    private readonly auth;
    constructor(auth: AuthService);
    login(input: LoginInput): Promise<{
        accessToken: string;
    } | null>;
}
export {};
