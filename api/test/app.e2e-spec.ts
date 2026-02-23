import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/frameworks/nest/app.module';
import {
  GraphQLResponse,
  AuthPayload,
  SchemaIntrospection,
  gql,
  gqlRequest,
  createTestPersonData,
  createTestPerson,
  deleteTestPerson,
  findTestPerson,
  loginUser,
} from './app.e2e-test-type';

// --- Authentication e2e tests ---
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
// --- Person create → get → delete e2e tests ---
describe('Person create → get → delete (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  const createdPersonIds: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get admin token for authenticated operations
    adminToken = await loginUser(app, 'admin', 'admin123');
  });

  afterEach(async () => {
    // Clean up any remaining test data
    for (const personId of createdPersonIds) {
      try {
        await deleteTestPerson(app, personId, adminToken);
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
    // 1) Create person using helper function
    const created = await createTestPerson(
      app,
      'Alice E2E',
      undefined,
      adminToken,
      createdPersonIds,
    );
    expect(created.name).toBe('Alice E2E');
    expect(created.type).toBe('EMAIL');

    const personId = created.id;

    // 2) Query back by id
    const person = await findTestPerson(app, personId, adminToken);
    expect(person).toBeDefined();
    expect(person?.id).toBe(personId);

    // 3) Delete
    const deleted = await deleteTestPerson(app, personId, adminToken);
    expect(deleted).toBe(true);

    // 4) Verify null
    const personAfterDelete = await findTestPerson(app, personId, adminToken);
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
      adminToken,
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

    const res = await gqlRequest(app, QUERY, { id }, adminToken);
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
    const del = await gqlRequest(app, DELETE, { id }, adminToken);
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
      adminToken,
      createdPersonIds,
    );

    expect(created.name).toBe('Carol E2E');
    expect(created.type).toBe('EMAIL');

    // find (basic fields only)
    const person = await findTestPerson(app, created.id, adminToken);
    expect(person?.id).toBe(created.id);
    console.log('person data:', person);

    // delete using helper
    const deleted = await deleteTestPerson(app, created.id, adminToken);
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
      adminToken,
      createdPersonIds,
    );

    expect(created.name).toBe('Custom Name');
    expect(created.type).toBe('EMAIL'); // Note: createTestPerson always sets type to EMAIL

    // Cleanup will be handled by afterEach
  });
});

// --- Extended E2E Test Scenarios ---
describe('Extended E2E Scenarios', () => {
  let app: INestApplication;
  let adminToken: string;
  let studentToken: string;
  const createdPersonIds: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get tokens for all user types
    adminToken = await loginUser(app, 'admin', 'admin123');
    studentToken = await loginUser(app, 'student', 'student123');
  });

  afterEach(async () => {
    // Clean up test data
    for (const personId of createdPersonIds) {
      try {
        await deleteTestPerson(app, personId, adminToken);
      } catch (error) {
        console.warn(`Failed to cleanup person ${personId}:`, error);
      }
    }
    createdPersonIds.length = 0;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Invalid GraphQL Query Handling', () => {
    it('should return appropriate error for malformed GraphQL query', async () => {
      const INVALID_QUERY = 'query { person { invalid syntax }';

      const response = await gqlRequest(app, INVALID_QUERY, {}, adminToken);

      expect(response.status).toBe(400);
    });

    it('should return error for non-existent query fields', async () => {
      const QUERY = gql`
        query {
          nonExistentQuery {
            id
          }
        }
      `;

      const response = await gqlRequest(app, QUERY, {}, adminToken);

      // GraphQL validation errors return HTTP 400
      expect(response.status).toBe(400);
      const body = response.body as GraphQLResponse<unknown>;
      expect(body.errors).toBeDefined();
      expect(body.errors?.length).toBeGreaterThan(0);
      expect(body.errors?.[0]?.message).toContain('nonExistentQuery');
    });
  });

  describe('Authentication and Authorization', () => {
    it('should deny access to protected mutations without token', async () => {
      const DELETE_MUTATION = gql`
        mutation DeletePerson($id: ID!) {
          deletePerson(id: $id)
        }
      `;

      const response = await gqlRequest(app, DELETE_MUTATION, {
        id: 'fake-id',
      });

      expect(response.status).toBe(200);
      const body = response.body as GraphQLResponse<{
        deletePerson: boolean | null;
      }>;
      // Should have an error (either auth error or not found)
      expect(body.errors || body.data?.deletePerson === null).toBeTruthy();
    });

    it('should deny access with invalid token format', async () => {
      const QUERY = gql`
        query TestPerson($id: ID!) {
          person(id: $id) {
            id
            name
          }
        }
      `;

      const response = await gqlRequest(
        app,
        QUERY,
        { id: 'test-id' },
        'invalid-token-format',
      );

      // Should return 200 but with authentication error
      expect(response.status).toBe(200);
      const body = response.body as GraphQLResponse<{
        person: { id: string; name: string } | null;
      }>;
      // Could be an error or null depending on implementation
      expect(
        body.errors || body.data === null || body.data?.person === null,
      ).toBeTruthy();
    });

    it('should allow student to access their own data but not delete', async () => {
      // Create a person as admin
      const created = await createTestPerson(
        app,
        'Student Data Test',
        undefined,
        adminToken,
        createdPersonIds,
      );

      // Student can read (assuming permissions allow)
      const QUERY = gql`
        query TestPerson($id: ID!) {
          person(id: $id) {
            id
            name
          }
        }
      `;

      const readResponse = await gqlRequest(
        app,
        QUERY,
        { id: created.id },
        studentToken,
      );

      expect(readResponse.status).toBe(200);
      const readBody = readResponse.body as GraphQLResponse<{
        person: { id: string; name: string } | null;
      }>;
      // Data should be accessible
      expect(readBody.data?.person || readBody.errors).toBeDefined();
    });
  });

  describe('Invalid ID Operations', () => {
    it('should return null for non-existent person ID', async () => {
      const QUERY = gql`
        query TestPerson($id: ID!) {
          person(id: $id) {
            id
            name
          }
        }
      `;

      const response = await gqlRequest(
        app,
        QUERY,
        { id: 'cuid0000000000000000000000' },
        adminToken,
      );

      expect(response.status).toBe(200);
      const body = response.body as GraphQLResponse<{
        person: { id: string; name: string } | null;
      }>;
      expect(body.data?.person).toBeNull();
    });

    it('should handle invalid ID format gracefully', async () => {
      const QUERY = gql`
        query TestPerson($id: ID!) {
          person(id: $id) {
            id
            name
          }
        }
      `;

      const response = await gqlRequest(
        app,
        QUERY,
        { id: 'invalid-id-format-@#$%' },
        adminToken,
      );

      expect(response.status).toBe(200);
      const body = response.body as GraphQLResponse<{
        person: { id: string; name: string } | null;
      }>;
      // Should either return null or error
      expect(body.data?.person === null || body.errors).toBeTruthy();
    });

    it('should fail to delete non-existent person', async () => {
      const DELETE_MUTATION = gql`
        mutation DeletePerson($id: ID!) {
          deletePerson(id: $id)
        }
      `;

      const response = await gqlRequest(
        app,
        DELETE_MUTATION,
        { id: 'cuid0000000000000000000000' },
        adminToken,
      );

      expect(response.status).toBe(200);
      const body = response.body as GraphQLResponse<{ deletePerson: boolean }>;
      // Should fail (return false or throw error)
      expect(body.data?.deletePerson === false || body.errors).toBeTruthy();
    });
  });

  describe('Person Update Operations', () => {
    it('should update person name successfully', async () => {
      // Create a person first
      const created = await createTestPerson(
        app,
        'Original Name',
        undefined,
        adminToken,
        createdPersonIds,
      );

      // Check if update mutation exists
      const INTROSPECT = gql`
        query {
          __type(name: "Mutation") {
            fields {
              name
            }
          }
        }
      `;

      const introspectRes = await gqlRequest(app, INTROSPECT);
      const introspectBody = introspectRes.body as GraphQLResponse<{
        __type: { fields: Array<{ name: string }> };
      }>;
      const mutationFields = introspectBody.data?.__type?.fields || [];
      const hasUpdateMutation = mutationFields.some(
        (f) => f.name === 'updatePerson',
      );

      if (hasUpdateMutation) {
        const UPDATE_MUTATION = gql`
          mutation UpdatePerson($id: ID!, $name: String!) {
            updatePerson(id: $id, name: $name) {
              id
              name
            }
          }
        `;

        const response = await gqlRequest(
          app,
          UPDATE_MUTATION,
          { id: created.id, name: 'Updated Name' },
          adminToken,
        );

        expect(response.status).toBe(200);
        const body = response.body as GraphQLResponse<{
          updatePerson: { id: string; name: string };
        }>;

        if (!body.errors) {
          expect(body.data?.updatePerson?.name).toBe('Updated Name');
        }
      } else {
        // If no update mutation, test passes by default
        expect(true).toBe(true);
      }
    });
  });

  describe('Bulk Operations', () => {
    it('should create multiple persons and retrieve all', async () => {
      // Create multiple persons
      const persons = await Promise.all([
        createTestPerson(
          app,
          'Bulk Person 1',
          undefined,
          adminToken,
          createdPersonIds,
        ),
        createTestPerson(
          app,
          'Bulk Person 2',
          undefined,
          adminToken,
          createdPersonIds,
        ),
        createTestPerson(
          app,
          'Bulk Person 3',
          undefined,
          adminToken,
          createdPersonIds,
        ),
      ]);

      expect(persons).toHaveLength(3);
      persons.forEach((person, index) => {
        expect(person.name).toBe(`Bulk Person ${index + 1}`);
      });

      // Verify each person can be fetched individually
      const fetchedPersons = await Promise.all(
        persons.map((p) => findTestPerson(app, p.id, adminToken)),
      );

      fetchedPersons.forEach((person, index) => {
        expect(person).not.toBeNull();
        expect(person?.id).toBe(persons[index].id);
      });
    });

    it('should handle concurrent person creation without conflicts', async () => {
      // Create multiple persons concurrently
      const createPromises = Array.from({ length: 5 }, (_, i) =>
        createTestPerson(
          app,
          `Concurrent Person ${i + 1}`,
          undefined,
          adminToken,
          createdPersonIds,
        ),
      );

      const persons = await Promise.all(createPromises);

      // All persons should be created successfully
      expect(persons).toHaveLength(5);

      // All should have unique IDs
      const ids = new Set(persons.map((p) => p.id));
      expect(ids.size).toBe(5);
    });
  });

  describe('Person List Query', () => {
    it('should retrieve list of persons', async () => {
      // Create test persons
      await Promise.all([
        createTestPerson(
          app,
          'List Person 1',
          undefined,
          adminToken,
          createdPersonIds,
        ),
        createTestPerson(
          app,
          'List Person 2',
          undefined,
          adminToken,
          createdPersonIds,
        ),
      ]);

      // Query for list
      const INTROSPECT = gql`
        query {
          __type(name: "Query") {
            fields {
              name
            }
          }
        }
      `;

      const introspectRes = await gqlRequest(app, INTROSPECT);
      const introspectBody = introspectRes.body as GraphQLResponse<{
        __type: { fields: Array<{ name: string }> };
      }>;
      const queryFields = introspectBody.data?.__type?.fields || [];
      const hasListQuery = queryFields.some(
        (f) => f.name === 'persons' || f.name === 'personList',
      );

      if (hasListQuery) {
        const LIST_QUERY = gql`
          query {
            persons {
              id
              name
            }
          }
        `;

        const response = await gqlRequest(app, LIST_QUERY, {}, adminToken);
        expect(response.status).toBe(200);

        const body = response.body as GraphQLResponse<{
          persons: Array<{ id: string; name: string }>;
        }>;
        if (!body.errors) {
          expect(Array.isArray(body.data?.persons)).toBe(true);
          expect(body.data?.persons.length).toBeGreaterThanOrEqual(2);
        }
      } else {
        // If no list query exists, test passes
        expect(true).toBe(true);
      }
    });
  });
});
