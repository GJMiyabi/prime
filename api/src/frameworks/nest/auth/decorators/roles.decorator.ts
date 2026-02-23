/**
 * Roles デコレーター
 * GraphQL Resolver に必要な役割を指定
 *
 * 使用例:
 * ```typescript
 * @Mutation('deletePerson')
 * @Roles(PrincipalKind.ADMIN)
 * async deletePerson(@Args('id') id: string) {
 *   return this.personInteractor.delete(id);
 * }
 * ```
 */

import { SetMetadata } from '@nestjs/common';
import { PrincipalKind } from 'src/domains/type/principal-kind';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: PrincipalKind[]) =>
  SetMetadata(ROLES_KEY, roles);
