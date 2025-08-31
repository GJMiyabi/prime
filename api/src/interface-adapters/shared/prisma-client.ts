import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

export class PrismaClientSingleton {
  private static _instance?: PrismaClient;
  public static get instance(): PrismaClient {
    if (!this._instance) {
      this._instance = new PrismaClient();
    }
    return this._instance;
  }
}
