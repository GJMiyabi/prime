import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  async get(): Promise<string> {
    await Promise.resolve();
    return '1';
  }
}
