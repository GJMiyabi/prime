import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

type JwtPayload = {
  sub: string; // principalId を入れる
  username?: string; // 任意
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
    return { sub: payload.sub, username: payload.username };
  }
}
