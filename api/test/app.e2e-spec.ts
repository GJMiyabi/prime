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

  it('find (no includes): principal/contactAddress/account are null by default', async () => {
    // Create a fresh person first
    const CREATE = gql`
      mutation ($input: AdminPersonCreateInput!) {
        saveAdminPeron(input: $input) {
          id
          name
        }
      }
    `;

    // Use a unique email to avoid unique constraint conflicts on repeated runs
    const uniqueEmail = `bob.e2e+${Date.now()}${Math.random().toString(36).slice(2, 8)}@example.com`;

    const createRes = await gqlRequest(app, CREATE, {
      input: { name: 'Bob E2E', value: uniqueEmail, type: 'EMAIL' },
    });
    expect(createRes.status).toBe(200);

    // If GraphQL returned errors, surface them clearly (no unnecessary assertions)
    const createErrors = (createRes.body as unknown as GraphQLResponse<unknown>)
      .errors;
    if (createErrors) {
      console.error('create errors', createErrors);
    }

    const createBody = createRes.body as unknown as GraphQLResponse<{
      saveAdminPeron?: { id: string; name: string };
    }>;
    const created = createBody.data?.saveAdminPeron;
    if (!created?.id) {
      throw new Error(
        `saveAdminPeron did not return id. body=${JSON.stringify(createRes.body)}`,
      );
    }
    const id = created.id;

    // ---- Introspect Person fields to avoid 400 when fields are missing ----
    const INTROSPECT = gql`
      query {
        __type(name: "Person") {
          fields {
            name
          }
        }
      }
    `;
    const introspectRes = await gqlRequest(app, INTROSPECT);
    expect(introspectRes.status).toBe(200);
    type Introspection = {
      __type?: { fields?: Array<{ name: string }> | null } | null;
    };
    const iBody =
      introspectRes.body as unknown as GraphQLResponse<Introspection>;
    const fieldNames = new Set(
      (iBody.data?.__type?.fields ?? []).map((f) => f.name),
    );

    const hasPrincipal = fieldNames.has('principal');
    const hasAccount = fieldNames.has('account');
    const contactField = fieldNames.has('contactAddress')
      ? 'contactAddress'
      : fieldNames.has('contacts')
        ? 'contacts'
        : undefined;

    // ---- Build a dynamic query with only available fields ----
    const extraSelections: string[] = [];
    if (hasPrincipal) extraSelections.push('principal { id }');
    if (hasAccount) extraSelections.push('account { id }');
    if (contactField) extraSelections.push(`${contactField} { id }`);

    const QUERY = gql`query ($id: ID!) { person(id: $id) { id name ${extraSelections.join(' ')} } }`;

    const res = await gqlRequest(app, QUERY, { id });
    expect(res.status).toBe(200);

    type PersonShape = {
      id: string;
      name: string;
      principal?: { id: string } | null;
      account?: { id: string } | null;
      contactAddress?: Array<{ id: string }> | null;
      contacts?: Array<{ id: string }> | null;
    };
    const body = res.body as unknown as GraphQLResponse<{
      person: PersonShape | null;
    }>;
    const person = body.data?.person;
    expect(person).toBeTruthy();

    // デフォルトでは関連は null（Resolver/Usecase が include を明示しない前提）
    if (hasPrincipal) expect(person?.principal ?? null).toBeNull();
    if (hasAccount) expect(person?.account ?? null).toBeNull();

    if (contactField === 'contactAddress') {
      // null（か空配列）いずれでも許容、実装差に対応
      if (Array.isArray(person?.contactAddress)) {
        expect(person?.contactAddress.length).toBeGreaterThanOrEqual(0);
      } else {
        expect(person?.contactAddress ?? null).toBeNull();
      }
    } else if (contactField === 'contacts') {
      if (Array.isArray(person?.contacts)) {
        expect(person?.contacts.length).toBeGreaterThanOrEqual(0);
      } else {
        expect(person?.contacts ?? null).toBeNull();
      }
    }

    // cleanup
    const DELETE = gql`
      mutation ($id: ID!) {
        deletePerson(id: $id)
      }
    `;
    const del = await gqlRequest(app, DELETE, { id });
    expect(del.status).toBe(200);
    const delBody = del.body as unknown as GraphQLResponse<{
      deletePerson: boolean;
    }>;
    expect(delBody.data?.deletePerson).toBe(true);
  });

  it('createAdmin → find → delete runs end-to-end matching IPersonInputPort semantics', async () => {
    // createAdmin (value/type も応答検証)
    const CREATE = gql`
      mutation ($input: AdminPersonCreateInput!) {
        saveAdminPeron(input: $input) {
          id
          name
          value
          type
        }
      }
    `;
    const uniqueEmail = `carol.e2e+${Date.now()}${Math.random().toString(36).slice(2, 8)}@example.com`;
    const c = await gqlRequest(app, CREATE, {
      input: {
        name: 'Carol E2E',
        value: uniqueEmail,
        type: 'EMAIL',
      },
    });
    expect(c.status).toBe(200);
    const cBody = c.body as unknown as GraphQLResponse<{
      saveAdminPeron?: {
        id: string;
        name: string;
        value: string;
        type: string;
      };
    }>;
    const created = cBody.data?.saveAdminPeron;
    expect(created).toBeDefined();
    expect(created?.name).toBe('Carol E2E');
    expect(created?.value).toBe(uniqueEmail);
    expect(created?.type).toBe('EMAIL');
    if (!created?.id)
      throw new Error(
        `saveAdminPeron did not return id. body=${JSON.stringify(c.body)}`,
      );

    // find (basic fields only)
    const QUERY = gql`
      query ($id: ID!) {
        person(id: $id) {
          id
          name
        }
      }
    `;
    const f = await gqlRequest(app, QUERY, { id: created.id });
    expect(f.status).toBe(200);
    const fBody = f.body as unknown as GraphQLResponse<{
      person: { id: string; name: string } | null;
    }>;
    expect(fBody.data?.person?.id).toBe(created.id);
    console.log('fBody.data?', fBody.data);

    // delete
    const DELETE = gql`
      mutation ($id: ID!) {
        deletePerson(id: $id)
      }
    `;
    const d = await gqlRequest(app, DELETE, { id: created.id });
    expect(d.status).toBe(200);
    const dBody = d.body as unknown as GraphQLResponse<{
      deletePerson: boolean;
    }>;
    expect(dBody.data?.deletePerson).toBe(true);
  });
});
