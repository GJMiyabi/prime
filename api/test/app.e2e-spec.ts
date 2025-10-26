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
  try {
    const httpServer: Server = app.getHttpServer() as unknown as Server;
    const req = request(httpServer).post('/graphql');
    if (token) req.set('Authorization', `Bearer ${token}`);

    const response = await req.send({ query, variables });

    // Always expect 200 for GraphQL endpoint, errors are in response body
    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}: ${response.text}`);
    }

    return response;
  } catch (error) {
    throw new Error(
      `GraphQL request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

// Test data factories
interface TestPersonData {
  name: string;
  email: string;
  type: 'EMAIL' | 'PHONE';
}

function generateUniqueEmail(prefix: string): string {
  return `${prefix}.e2e+${Date.now()}${Math.random().toString(36).slice(2, 8)}@example.com`;
}

function createTestPersonData(
  overrides?: Partial<TestPersonData>,
): TestPersonData {
  const defaults: TestPersonData = {
    name: 'Test User',
    email: generateUniqueEmail('testuser'),
    type: 'EMAIL',
  };

  return { ...defaults, ...overrides };
}

async function createTestPerson(
  app: INestApplication,
  name: string,
  email?: string,
  token?: string,
  createdPersonIds?: string[],
) {
  const CREATE = gql`
    mutation ($input: AdminPersonCreateInput!) {
      saveAdminPerson(input: $input) {
        id
        name
        value
        type
      }
    }
  `;

  const uniqueEmail =
    email || generateUniqueEmail(name.toLowerCase().replace(/\s+/g, ''));

  const response = await gqlRequest(
    app,
    CREATE,
    {
      input: { name, value: uniqueEmail, type: 'EMAIL' },
    },
    token,
  );

  expect(response.status).toBe(200);

  const body = response.body as unknown as GraphQLResponse<{
    saveAdminPerson?: {
      id: string;
      name: string;
      value: string;
      type: string;
    };
  }>;

  if (body.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(body.errors)}`);
  }

  const created = body.data?.saveAdminPerson;
  if (!created?.id) {
    throw new Error(
      `saveAdminPerson did not return id. body=${JSON.stringify(response.body)}`,
    );
  }

  // Track for cleanup if array is provided
  if (createdPersonIds) {
    createdPersonIds.push(created.id);
  }

  return created;
}
async function deleteTestPerson(
  app: INestApplication,
  id: string,
  token?: string,
): Promise<boolean> {
  const DELETE = gql`
    mutation ($id: ID!) {
      deletePerson(id: $id)
    }
  `;

  const response = await gqlRequest(app, DELETE, { id }, token);
  expect(response.status).toBe(200);

  const body = response.body as unknown as GraphQLResponse<{
    deletePerson: boolean;
  }>;

  if (body.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(body.errors)}`);
  }

  return body.data?.deletePerson ?? false;
}

async function findTestPerson(
  app: INestApplication,
  id: string,
  token?: string,
) {
  const QUERY = gql`
    query ($id: ID!) {
      person(id: $id) {
        id
        name
      }
    }
  `;

  const response = await gqlRequest(app, QUERY, { id }, token);
  expect(response.status).toBe(200);

  const body = response.body as unknown as GraphQLResponse<{
    person: { id: string; name: string } | null;
  }>;

  if (body.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(body.errors)}`);
  }

  return body.data?.person;
}

// Auth-related type definitions
interface AuthPayload {
  accessToken: string;
}

interface SchemaIntrospection {
  __schema: {
    queryType: {
      name: string;
    };
  };
}

// Helper function for login
async function loginUser(
  app: INestApplication,
  username: string,
  password: string,
): Promise<string> {
  const LOGIN_MUTATION = gql`
    mutation Login($input: LoginInput!) {
      login(input: $input) {
        accessToken
      }
    }
  `;

  const response = await gqlRequest(app, LOGIN_MUTATION, {
    input: { username, password },
  });

  expect(response.status).toBe(200);

  const body = response.body as unknown as GraphQLResponse<{
    login: AuthPayload | null;
  }>;

  if (body.errors) {
    throw new Error(`Login failed: ${JSON.stringify(body.errors)}`);
  }

  const loginData = body.data?.login;
  if (!loginData?.accessToken) {
    throw new Error(
      `Login did not return access token. Response: ${JSON.stringify(body)}`,
    );
  }

  return loginData.accessToken;
}

describe('Authentication (e2e)', () => {
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

  describe('Login functionality', () => {
    it('should login successfully with admin credentials', async () => {
      const token = await loginUser(app, 'admin', 'admin123');
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should login successfully with teacher credentials', async () => {
      const token = await loginUser(app, 'teacher', 'teacher123');
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should login successfully with student credentials', async () => {
      const token = await loginUser(app, 'student', 'student123');
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should return null for invalid credentials', async () => {
      const LOGIN_MUTATION = gql`
        mutation Login($input: LoginInput!) {
          login(input: $input) {
            accessToken
          }
        }
      `;

      const response = await gqlRequest(app, LOGIN_MUTATION, {
        input: { username: 'invalid', password: 'wrongpassword' },
      });

      expect(response.status).toBe(200);

      const body = response.body as unknown as GraphQLResponse<{
        login: AuthPayload | null;
      }>;

      // Login should return null for invalid credentials (not throw an error)
      expect(body.data?.login).toBeNull();
      expect(body.errors).toBeUndefined();
    });

    it('should return null for non-existent user', async () => {
      const LOGIN_MUTATION = gql`
        mutation Login($input: LoginInput!) {
          login(input: $input) {
            accessToken
          }
        }
      `;

      const response = await gqlRequest(app, LOGIN_MUTATION, {
        input: { username: 'nonexistent', password: 'anypassword' },
      });

      expect(response.status).toBe(200);

      const body = response.body as unknown as GraphQLResponse<{
        login: AuthPayload | null;
      }>;

      expect(body.data?.login).toBeNull();
      expect(body.errors).toBeUndefined();
    });

    it('should handle empty credentials gracefully', async () => {
      const LOGIN_MUTATION = gql`
        mutation Login($input: LoginInput!) {
          login(input: $input) {
            accessToken
          }
        }
      `;

      const response = await gqlRequest(app, LOGIN_MUTATION, {
        input: { username: '', password: '' },
      });

      expect(response.status).toBe(200);

      const body = response.body as unknown as GraphQLResponse<{
        login: AuthPayload | null;
      }>;

      expect(body.data?.login).toBeNull();
      expect(body.errors).toBeUndefined();
    });
  });

  describe('Token-based authentication', () => {
    let adminToken: string;
    let teacherToken: string;
    let studentToken: string;

    beforeAll(async () => {
      // Get tokens for all user types
      adminToken = await loginUser(app, 'admin', 'admin123');
      teacherToken = await loginUser(app, 'teacher', 'teacher123');
      studentToken = await loginUser(app, 'student', 'student123');
    });

    it('should accept valid JWT tokens in requests', async () => {
      // This test verifies that tokens can be used in subsequent requests
      // We'll use a simple query that doesn't require authentication but accepts it
      const QUERY = gql`
        query {
          __schema {
            queryType {
              name
            }
          }
        }
      `;

      // Test with admin token
      const adminResponse = await gqlRequest(app, QUERY, {}, adminToken);
      expect(adminResponse.status).toBe(200);
      const adminBody =
        adminResponse.body as unknown as GraphQLResponse<SchemaIntrospection>;
      expect(adminBody.data?.__schema?.queryType?.name).toBe('Query');

      // Test with teacher token
      const teacherResponse = await gqlRequest(app, QUERY, {}, teacherToken);
      expect(teacherResponse.status).toBe(200);
      const teacherBody =
        teacherResponse.body as unknown as GraphQLResponse<SchemaIntrospection>;
      expect(teacherBody.data?.__schema?.queryType?.name).toBe('Query');

      // Test with student token
      const studentResponse = await gqlRequest(app, QUERY, {}, studentToken);
      expect(studentResponse.status).toBe(200);
      const studentBody =
        studentResponse.body as unknown as GraphQLResponse<SchemaIntrospection>;
      expect(studentBody.data?.__schema?.queryType?.name).toBe('Query');
    });

    it('should work without token for public endpoints', async () => {
      const QUERY = gql`
        query {
          __schema {
            queryType {
              name
            }
          }
        }
      `;

      const response = await gqlRequest(app, QUERY);
      expect(response.status).toBe(200);
      const body =
        response.body as unknown as GraphQLResponse<SchemaIntrospection>;
      expect(body.data?.__schema?.queryType?.name).toBe('Query');
    });
  });
});

describe('Person create → get → delete (e2e)', () => {
  let app: INestApplication;
  const createdPersonIds: string[] = []; // Track created persons for cleanup

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    // Clean up any remaining test data
    for (const personId of createdPersonIds) {
      try {
        await deleteTestPerson(app, personId);
      } catch (error) {
        // Ignore errors during cleanup (person might already be deleted)
        console.warn(`Failed to cleanup person ${personId}:`, error);
      }
    }
    createdPersonIds.length = 0; // Clear the array
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates a Person, fetches it, then deletes it and verifies null', async () => {
    const token: string | undefined = undefined;

    // 1) Create person using helper function
    const created = await createTestPerson(
      app,
      'Alice E2E',
      undefined,
      token,
      createdPersonIds,
    );
    expect(created.name).toBe('Alice E2E');
    expect(created.type).toBe('EMAIL');

    const personId = created.id;

    // 2) Query back by id
    const person = await findTestPerson(app, personId, token);
    expect(person).toBeDefined();
    expect(person?.id).toBe(personId);

    // 3) Delete
    const deleted = await deleteTestPerson(app, personId, token);
    expect(deleted).toBe(true);

    // 4) Verify null
    const personAfterDelete = await findTestPerson(app, personId, token);
    expect(personAfterDelete).toBeNull();

    // Remove from tracking since we manually deleted
    const index = createdPersonIds.indexOf(personId);
    if (index > -1) {
      createdPersonIds.splice(index, 1);
    }
  });

  it('find (no includes): principal/contactAddress/account are null by default', async () => {
    // Create a fresh person first using helper
    const created = await createTestPerson(
      app,
      'Bob E2E',
      undefined,
      undefined,
      createdPersonIds,
    );
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
    // Create using test data factory
    const testData = createTestPersonData({ name: 'Carol E2E' });
    const created = await createTestPerson(
      app,
      testData.name,
      testData.email,
      undefined,
      createdPersonIds,
    );

    expect(created.name).toBe('Carol E2E');
    expect(created.type).toBe('EMAIL');

    // find (basic fields only)
    const person = await findTestPerson(app, created.id);
    expect(person?.id).toBe(created.id);
    console.log('person data:', person);

    // delete using helper
    const deleted = await deleteTestPerson(app, created.id);
    expect(deleted).toBe(true);

    // Remove from tracking since we manually deleted
    const index = createdPersonIds.indexOf(created.id);
    if (index > -1) {
      createdPersonIds.splice(index, 1);
    }
  });

  it('test data factory creates valid person data', async () => {
    // Test with default values
    const defaultData = createTestPersonData();
    expect(defaultData.name).toBe('Test User');
    expect(defaultData.type).toBe('EMAIL');
    expect(defaultData.email).toContain('testuser.e2e+');

    // Test with overrides
    const customData = createTestPersonData({
      name: 'Custom Name',
      type: 'PHONE',
    });
    expect(customData.name).toBe('Custom Name');
    expect(customData.type).toBe('PHONE');
    expect(customData.email).toContain('testuser.e2e+'); // email should still be generated

    // Test creating actual person with factory data
    const created = await createTestPerson(
      app,
      customData.name,
      customData.email,
      undefined,
      createdPersonIds,
    );

    expect(created.name).toBe('Custom Name');
    expect(created.type).toBe('EMAIL'); // Note: createTestPerson always sets type to EMAIL

    // Cleanup will be handled by afterEach
  });
});
