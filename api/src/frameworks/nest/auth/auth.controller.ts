import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RequestWithUser } from '../shared/types/request.types';

@Controller('auth')
export class AuthController {
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req: RequestWithUser) {
    // req.user に LocalStrategy.validate の return が入っている
    return req.user;
  }
}
