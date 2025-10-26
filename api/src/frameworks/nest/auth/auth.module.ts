import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthResolver } from './auth.resolver';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/strategy';
import {
  IAccountCommandRepository,
  IAccountQueryRepository,
} from 'src/domains/repositories/account.repositories';
import {
  AccountCommandRepository,
  AccountQueryRepository,
} from 'src/interface-adapters/repositories/prisma/account.repository';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }), // セッション無しの stateless 推奨
    JwtModule.register({
      secret: process.env.JWT_SECRET!,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN ?? '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthResolver,
    JwtStrategy,
    LocalStrategy,
    { provide: IAccountCommandRepository, useClass: AccountCommandRepository },
    { provide: IAccountQueryRepository, useClass: AccountQueryRepository },
  ],
  exports: [AuthService, JwtStrategy, LocalStrategy], // 他モジュールから使えるように
})
export class AuthModule {}
