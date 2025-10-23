import { Mutation, Resolver, Args, Query, Info } from '@nestjs/graphql';
import {
  IPersonInputPort,
  AdminPersonCreateDto,
  PersonCreateDto,
  PersonIncludeOptions,
} from 'src/usecases/person/input-port';
import { GraphQLResolveInfo } from 'graphql';

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
export class PersonMutationResolver {
  constructor(private readonly personInputport: IPersonInputPort) {}

  @Mutation('saveAdminPerson')
  async saveAdminPerson(@Args('input') input: AdminPersonCreateDto) {
    try {
      const admin = await this.personInputport.createAdmin(input);

      return {
        __type: 'AdminPerson',
        ...admin,
      };
    } catch (error) {
      throw new Error(
        `Failed to create admin person: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  @Mutation('createSinglePerson')
  async createSinglePerson(@Args('input') input: PersonCreateDto) {
    try {
      const person = await this.personInputport.createPerson(input);

      return {
        __type: 'SinglePerson',
        ...person,
      };
    } catch (error) {
      throw new Error(
        `Failed to create person: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  @Mutation('deletePerson')
  async deletePerson(@Args('id') id: string): Promise<boolean> {
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
