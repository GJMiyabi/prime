import { INestApplication } from '@nestjs/common';
import type { Server } from 'http';
import * as request from 'supertest';

// GraphQL response types
export interface GqlError {
  message: string;
  [k: string]: unknown;
}

export interface GraphQLResponse<T> {
  data?: T;
  errors?: GqlError[];
}

// Authentication types
export interface AuthPayload {
  accessToken: string;
}

export interface LoginInput {
  username: string;
  password: string;
}

// Test data types
export interface TestPersonData {
  name: string;
  email: string;
  type: 'EMAIL' | 'PHONE';
}

// GraphQL schema introspection types
export interface SchemaIntrospection {
  __schema: {
    queryType: {
      name: string;
    };
  };
}

// GraphQL helper (template literal passthrough)
export const gql = (l: TemplateStringsArray, ...a: unknown[]) =>
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

// GraphQL request helper
export async function gqlRequest(
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

    // For malformed queries (HTTP 400), validation errors (HTTP 400), return the response
    // to allow tests to check error responses
    if (response.status === 400) {
      return response;
    }

    // For other non-200 status codes, throw error
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

// Test data utility functions
export function generateUniqueEmail(prefix: string): string {
  return `${prefix}.e2e+${Date.now()}${Math.random().toString(36).slice(2, 8)}@example.com`;
}

export function createTestPersonData(
  overrides?: Partial<TestPersonData>,
): TestPersonData {
  const defaults: TestPersonData = {
    name: 'Test User',
    email: generateUniqueEmail('testuser'),
    type: 'EMAIL',
  };

  return { ...defaults, ...overrides };
}

// Test helper functions
export async function createTestPerson(
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

  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }

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

export async function deleteTestPerson(
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
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }

  const body = response.body as unknown as GraphQLResponse<{
    deletePerson: boolean;
  }>;

  if (body.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(body.errors)}`);
  }

  return body.data?.deletePerson ?? false;
}

export async function findTestPerson(
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
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }

  const body = response.body as unknown as GraphQLResponse<{
    person: { id: string; name: string } | null;
  }>;

  if (body.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(body.errors)}`);
  }

  return body.data?.person;
}

export async function loginUser(
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

  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }

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
