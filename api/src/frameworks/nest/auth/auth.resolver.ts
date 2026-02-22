import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { SkipCsrf } from './decorators/skip-csrf.decorator';

type LoginInput = { username: string; password: string };

@Resolver()
export class AuthResolver {
  constructor(private readonly auth: AuthService) {}

  @Mutation('login')
  @SkipCsrf() // ログインは初回アクセスなのでCSRF保護をスキップ
  async login(@Args('input') input: LoginInput) {
    return this.auth.login(input.username, input.password);
  }
}
