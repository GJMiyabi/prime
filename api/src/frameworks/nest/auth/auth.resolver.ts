import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';

type LoginInput = { username: string; password: string };

@Resolver()
export class AuthResolver {
  constructor(private readonly auth: AuthService) {}

  @Mutation('login')
  async login(@Args('input') input: LoginInput) {
    return this.auth.login(input.username, input.password);
  }
}
