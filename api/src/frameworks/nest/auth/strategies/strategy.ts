import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

/**
 * LocalStrategy:
 * username/password を使ったログイン認証
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    // デフォルトでは username / password をフィールドとして受け取る
    // { usernameField: 'username', passwordField: 'password' } で明示指定も可能
    super({ usernameField: 'username', passwordField: 'password' });
  }

  async validate(username: string, password: string) {
    // AuthService に認証処理を委譲
    const account = await this.authService.validateUser(username, password);
    if (!account) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return account; // request.user に格納される
  }
}
