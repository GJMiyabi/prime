"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaClientSingleton = void 0;
require("dotenv/config");
const client_1 = require("@prisma/client");
class PrismaClientSingleton {
    static _instance;
    static get instance() {
        if (!this._instance) {
            this._instance = new client_1.PrismaClient();
        }
        return this._instance;
    }
}
exports.PrismaClientSingleton = PrismaClientSingleton;
//# sourceMappingURL=prisma-client.js.map