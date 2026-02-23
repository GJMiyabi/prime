import {
  Mutation,
  Resolver,
  Args,
  Query,
  Info,
  // Context, // 認証コンテキストを使用する場合
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import {
  IPersonInputPort,
  AdminPersonCreateDto,
  PersonCreateDto,
  PersonIncludeOptions,
} from 'src/usecases/person/input-port';
import { ContactType } from 'src/domains/type/contact';
import { GraphQLResolveInfo } from 'graphql';
import { PrincipalKind } from 'src/domains/type/principal-kind';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SanitizationPipe } from '../shared/pipes/sanitization.pipe';
// import { GqlAuthGuard } from '../auth/guards/gql-auth.guard'; // 認証ガードを使用する場合
// import { GraphContext } from '../shared/graphql/graphql.context'; // 認証コンテキストを使用する場合

// 認証が必要なリゾルバーの使用例:
// @UseGuards(GqlAuthGuard)
// async someAuthenticatedMethod(@Context() context: GraphContext) {
//   const principalId = context.principalId;
//   // 認証されたユーザーのプリンシパルIDを使用した処理
// }

import graphqlFields from 'graphql-fields';

// Narrow util types
type GraphQLFieldsTree = { [key: string]: GraphQLFieldsTree };

function getSelectionTree(info?: GraphQLResolveInfo): GraphQLFieldsTree {
  if (!info) return {};
  // Handle both CJS default export and ESM named default in a type-safe way
  const modUnknown: unknown = graphqlFields as unknown;

  let callable: ((i: GraphQLResolveInfo) => unknown) | null = null;
  if (typeof modUnknown === 'function') {
    callable = modUnknown as (i: GraphQLResolveInfo) => unknown;
  } else if (
    modUnknown &&
    typeof (modUnknown as { default?: unknown }).default === 'function'
  ) {
    callable = (modUnknown as { default: (i: GraphQLResolveInfo) => unknown })
      .default;
  }

  if (!callable) return {};
  try {
    const out = callable(info);
    return typeof out === 'object' && out !== null
      ? (out as GraphQLFieldsTree)
      : {};
  } catch {
    return {};
  }
}

function hasPath(obj: unknown, path: string): boolean {
  if (!obj || typeof obj !== 'object') return false;
  let current: unknown = obj;
  for (const key of path.split('.')) {
    if (!current || typeof current !== 'object') return false;
    const record = current as Record<string, unknown>;
    if (!(key in record)) return false;
    current = record[key];
  }
  return true;
}

@Resolver()
@UseGuards(RolesGuard)
export class PersonMutationResolver {
  constructor(private readonly personInputport: IPersonInputPort) {}

  @Mutation('saveAdminPerson')
  @Roles(PrincipalKind.ADMIN) // ✅ ADMINのみアクセス可能
  async saveAdminPerson(@Args('input', SanitizationPipe) input: unknown) {
    try {
      // GraphQL input validation and transformation
      const rawInput = input as Record<string, unknown>;

      if (!rawInput.name || typeof rawInput.name !== 'string') {
        throw new Error('name field is required and must be a string');
      }
      if (!rawInput.value || typeof rawInput.value !== 'string') {
        throw new Error('value field is required and must be a string');
      }
      if (!rawInput.type || typeof rawInput.type !== 'string') {
        throw new Error('type field is required and must be a string');
      }

      // GraphQL input (value, type) を DTO format (contactValue, contactType) に変換
      const adminDto: AdminPersonCreateDto = {
        id: typeof rawInput.id === 'string' ? rawInput.id : undefined,
        name: rawInput.name,
        contactValue: rawInput.value,
        contactType: rawInput.type as ContactType,
      };

      const admin = await this.personInputport.createAdmin(adminDto);

      return {
        __type: 'AdminPerson',
        id: admin.id,
        name: admin.name,
        value: admin.contacts?.[0]?.value || '',
        type: admin.contacts?.[0]?.type || 'EMAIL',
      };
    } catch (error) {
      throw new Error(
        `Failed to create admin person: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  @Mutation('createSinglePerson')
  @Roles(
    PrincipalKind.ADMIN,
    PrincipalKind.TEACHER,
    PrincipalKind.STUDENT,
    PrincipalKind.STAKEHOLDER,
  ) // ✅ 認証済みユーザー全員がアクセス可能
  async createSinglePerson(@Args('input', SanitizationPipe) input: unknown) {
    try {
      // GraphQL input validation and transformation
      const rawInput = input as Record<string, unknown>;

      if (!rawInput.name || typeof rawInput.name !== 'string') {
        throw new Error('name field is required and must be a string');
      }
      if (!rawInput.value || typeof rawInput.value !== 'string') {
        throw new Error('value field is required and must be a string');
      }

      // GraphQL input (value) を DTO format (contactValue) に変換
      const personDto: PersonCreateDto = {
        name: rawInput.name,
        contactValue: rawInput.value,
        contactType: ContactType.EMAIL, // デフォルトでEMAIL
      };

      const person = await this.personInputport.createPerson(personDto);

      return {
        __type: 'SinglePerson',
        id: person.id,
        name: person.name,
        value: person.contacts?.[0]?.value || '',
      };
    } catch (error) {
      throw new Error(
        `Failed to create person: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  @Mutation('deletePerson')
  @Roles(PrincipalKind.ADMIN) // ✅ ADMINのみ削除可能
  async deletePerson(
    @Args('id', SanitizationPipe) id: string,
  ): Promise<boolean> {
    try {
      await this.personInputport.delete(id);
      return true;
    } catch (error) {
      throw new Error(
        `Failed to delete person: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}

@Resolver()
export class PersonQueryResolver {
  constructor(private readonly personInputPort: IPersonInputPort) {}

  @Query(() => Object, { name: 'person' })
  async findPerson(
    @Args('id') id: string,
    @Args('include') include?: PersonIncludeOptions,
    @Info() info?: GraphQLResolveInfo,
  ) {
    try {
      const selectionTree: unknown = getSelectionTree(info);
      const has = (path: string) => hasPath(selectionTree, path);

      const effectiveInclude = {
        contacts: include?.contacts ?? has('contacts'),
        principal:
          include?.principal || has('principal')
            ? {
                include: {
                  account:
                    include?.principal?.include?.account ??
                    has('principal.account'),
                },
              }
            : undefined,
        facilities: include?.facilities ?? has('facilities'),
        organization: include?.organization ?? has('organization'),
      } as const;

      const person = await this.personInputPort.find(id, effectiveInclude);

      if (!person) {
        return null;
      }

      return {
        __type: 'Person',
        ...person,
      };
    } catch (error) {
      throw new Error(
        `Failed to find person: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
