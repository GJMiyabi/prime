import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/frameworks/nest/app.module';
import type { Server } from 'http';

// Typed GraphQL response helpers
interface GqlError {
  message: string;
  [k: string]: unknown;
}
interface GraphQLResponse<T> {
  data?: T;
  errors?: GqlError[];
}

// GraphQL helper (template literal passthrough)
const gql = (l: TemplateStringsArray, ...a: unknown[]) =>
  l.reduce<string>((s, c, i) => {
    const part = a[i];
    return (
      s +
      c +
      (part !== undefined
        ? typeof part === 'string'
          ? part
          : JSON.stringify(part)
        : '')
    );
  }, '');

async function gqlRequest(
  app: INestApplication,
  query: string,
  variables?: Record<string, unknown>,
  token?: string,
) {
  const httpServer: Server = app.getHttpServer() as unknown as Server;
  const req = request(httpServer).post('/graphql');
  if (token) req.set('Authorization', `Bearer ${token}`);
  return req.send({ query, variables });
}

describe('Person create → get → delete (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates a Person, fetches it, then deletes it and verifies null', async () => {
    // If auth guards are enabled, supply a token here
    const token: string | undefined = undefined;

    // 1) Create via saveAdminPeron (schema-first name as implemented)
    const CREATE = gql`
      mutation Create($input: AdminPersonCreateInput!) {
        saveAdminPeron(input: $input) {
          id
          name
          value
          type
        }
      }
    `;

    const createRes = await gqlRequest(
      app,
      CREATE,
      {
        input: {
          name: 'Alice E2E',
          value: 'alice.e2e@example.com',
          type: 'EMAIL',
        },
      },
      token,
    );

    expect(createRes.status).toBe(200);
    interface CreatedPerson {
      id: string;
      name: string;
      value: string;
      type: string;
    }
    const createBody = createRes.body as unknown as GraphQLResponse<{
      saveAdminPeron?: CreatedPerson;
    }>;
    const created = createBody.data?.saveAdminPeron;
    console.log('created', created);
    expect(created).toBeDefined();
    expect(created?.name).toBe('Alice E2E');
    expect(created?.type).toBe('EMAIL');
    if (!created?.id) {
      throw new Error('Expected created person to have an id');
    }
    const personId: string = created.id;
    expect(personId).toBeTruthy();

    // 2) Query back by id
    const QUERY_ONE = gql`
      query One($id: ID!) {
        person(id: $id) {
          id
          name
        }
      }
    `;

    const queryRes = await gqlRequest(app, QUERY_ONE, { id: personId }, token);

    expect(queryRes.status).toBe(200);
    interface Person {
      id: string;
      name: string;
    }
    const queryBody = queryRes.body as unknown as GraphQLResponse<{
      person: Person | null;
    }>;
    const one = queryBody.data?.person;
    console.log('one', one);
    expect(one).toBeDefined();
    expect(one?.id).toBe(personId);

    // 3) Delete
    const DELETE = gql`
      mutation Del($id: ID!) {
        deletePerson(id: $id)
      }
    `;

    const deleteRes = await gqlRequest(app, DELETE, { id: personId }, token);
    expect(deleteRes.status).toBe(200);
    const deleteBody = deleteRes.body as unknown as GraphQLResponse<{
      deletePerson: boolean;
    }>;
    const deleted = deleteBody.data?.deletePerson;
    expect(deleted).toBe(true);

    // 4) Verify null
    const queryAfter = await gqlRequest(
      app,
      QUERY_ONE,
      { id: personId },
      token,
    );
    expect(queryAfter.status).toBe(200);
    const afterBody = queryAfter.body as unknown as GraphQLResponse<{
      person: Person | null;
    }>;
    expect(afterBody.data?.person).toBeNull();
  });
});
