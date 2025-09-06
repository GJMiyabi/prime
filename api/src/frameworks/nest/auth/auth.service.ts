import {
  Injectable,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { AccountQueryRepository } from 'src/interface-adapters/repositories/prisma/account.repository';
import { JwtService } from '@nestjs/jwt';
import { IAccountQueryRepository } from 'src/domains/repositories/account.repositories';

// Return only a sanitized view (no password)
export type AuthenticatedAccount = {
  id: string;
  principalId: string;
  username: string | undefined;
  email: string | null | undefined;
};

@Injectable()
export class AuthService {
  constructor(
    @Inject(IAccountQueryRepository)
    private readonly accountQueryRepository: AccountQueryRepository,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<AuthenticatedAccount | null> {
    try {
      const account =
        await this.accountQueryRepository.findByUsername(username);
      if (!account || !account.isEnabled()) return null;

      const isMatch = await argon2.verify(account.getPassword(), password);
      if (!isMatch) return null;

      // 返却は DTO（パスワードを含めない）
      return {
        id: account.getId(),
        principalId: account.getPrincipalId(),
        username: account.getUsername(),
        email: account.getEmail(),
      };
    } catch (err: unknown) {
      // 型安全に絞り込む
      if (err instanceof Error) {
        // ここでログに出すなど
        throw new InternalServerErrorException(err.message);
      }
      throw new InternalServerErrorException('Authentication failed');
    }
  }

  async login(username: string, password: string) {
    const account = await this.validateUser(username, password);
    if (!account) return null;

    const payload = {
      sub: account.principalId, // principalId を sub にするのが認可設計的に吉
      username: account.username,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }
}
