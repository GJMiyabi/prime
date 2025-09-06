import { AccountQueryRepository } from 'src/interface-adapters/repositories/prisma/account.repository';
import { JwtService } from '@nestjs/jwt';
export type AuthenticatedAccount = {
    id: string;
    principalId: string;
    username: string | undefined;
    email: string | null | undefined;
};
export declare class AuthService {
    private readonly accountQueryRepository;
    private readonly jwtService;
    constructor(accountQueryRepository: AccountQueryRepository, jwtService: JwtService);
    validateUser(username: string, password: string): Promise<AuthenticatedAccount | null>;
    login(username: string, password: string): Promise<{
        accessToken: string;
    } | null>;
}
