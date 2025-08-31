import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
export declare class PrismaClientSingleton {
    private static _instance?;
    static get instance(): PrismaClient;
}
