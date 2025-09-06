import { ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
declare const GqlAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class GqlAuthGuard extends GqlAuthGuard_base {
    getRequest(context: ExecutionContext): Request;
}
export {};
