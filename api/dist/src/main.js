"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./frameworks/nest/app.module");
const cookieParser = require("cookie-parser");
const config_1 = require("./frameworks/config/config");
const common_1 = require("@nestjs/common");
const port = 4000;
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { cors: true });
    process.env.TZ = 'UTC';
    const message = `Start Server with port = ${port}, environment = ${config_1.environment}`;
    common_1.Logger.log(message, 'main');
    app.use(cookieParser());
    await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
//# sourceMappingURL=main.js.map