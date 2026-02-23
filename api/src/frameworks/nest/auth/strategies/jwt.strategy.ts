import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

type JwtPayload = {
  sub: string; // principalId を入れる
  username?: string; // 任意
  email?: string;
  role?: string; // PrincipalKind
  accountId?: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET!, // HS256
      ignoreExpiration: false,
    });
  }

  validate(payload: JwtPayload) {
    // ここで返したオブジェクトが req.user / GQL context.user に入る
    // RolesGuardがroleを使用するため、ペイロードの全情報を返す
    return {
      sub: payload.sub,
      username: payload.username,
      email: payload.email,
      role: payload.role,
      accountId: payload.accountId,
    };
  }
}
