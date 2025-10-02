/**
 * Test helper utilities for creating mock requests and responses
 */

export interface MockRequestOptions {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: any;
  cookies?: Record<string, string>;
}

/**
 * Creates a mock Next.js request for testing
 */
export function createMockRequest(options: MockRequestOptions = {}): Request {
  const {
    method = 'GET',
    url = 'http://localhost/api/test',
    headers = {},
    body,
    cookies = {},
  } = options;

  const requestHeaders = new Headers({
    'Content-Type': 'application/json',
    ...headers,
  });

  // Add cookies to headers if provided
  if (Object.keys(cookies).length > 0) {
    const cookieString = Object.entries(cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
    requestHeaders.set('Cookie', cookieString);
  }

  const requestInit: RequestInit = {
    method,
    headers: requestHeaders,
  };

  // Add body for POST/PUT/PATCH requests
  if (
    body &&
    ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())
  ) {
    requestInit.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  return new Request(url, requestInit);
}

/**
 * Creates mock headers for testing
 */
export function createMockHeaders(
  headers: Record<string, string> = {}
): Headers {
  return new Headers(headers);
}

/**
 * Creates a mock FormData for testing file uploads
 */
export function createMockFormData(
  data: Record<string, string | File> = {}
): FormData {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value);
    } else {
      formData.append(key, value);
    }
  });

  return formData;
}

/**
 * Creates a mock File for testing file uploads
 */
export function createMockFile(
  content: string = 'test content',
  filename: string = 'test.txt',
  mimeType: string = 'text/plain'
): File {
  const blob = new Blob([content], { type: mimeType });
  return new File([blob], filename, { type: mimeType });
}

/**
 * Extracts JSON from a Response object for testing
 */
export async function extractJson(response: Response): Promise<any> {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Creates a mock fetch Response for testing external API calls
 */
export function createMockResponse(
  data: any,
  status: number = 200,
  headers: Record<string, string> = {}
): Response {
  const responseHeaders = new Headers({
    'Content-Type': 'application/json',
    ...headers,
  });

  return new Response(JSON.stringify(data), {
    status,
    headers: responseHeaders,
  });
}

/**
 * Creates a mock URL for testing
 */
export function createMockURL(
  pathname: string = '/api/test',
  searchParams: Record<string, string> = {},
  baseUrl: string = 'http://localhost'
): URL {
  const url = new URL(pathname, baseUrl);

  Object.entries(searchParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return url;
}

/**
 * Mock environment variables for testing
 */
export function mockEnvVars(
  vars: Record<string, string>,
  callback: () => void | Promise<void>
): void | Promise<void> {
  const originalEnv = process.env;

  try {
    process.env = { ...originalEnv, ...vars };
    return callback();
  } finally {
    process.env = originalEnv;
  }
}

/**
 * Creates a mock console for testing logging
 */
export function createMockConsole(): jest.Mocked<Console> {
  return {
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    assert: jest.fn(),
    clear: jest.fn(),
    count: jest.fn(),
    countReset: jest.fn(),
    dir: jest.fn(),
    dirxml: jest.fn(),
    group: jest.fn(),
    groupCollapsed: jest.fn(),
    groupEnd: jest.fn(),
    table: jest.fn(),
    time: jest.fn(),
    timeEnd: jest.fn(),
    timeLog: jest.fn(),
    timeStamp: jest.fn(),
    profile: jest.fn(),
    profileEnd: jest.fn(),
  } as any;
}

/**
 * Creates a mock Date for consistent testing
 */
export function mockDate(isoString: string): jest.SpyInstance {
  const mockDate = new Date(isoString);
  return jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
}

/**
 * Waits for a specified amount of time (for testing async operations)
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Creates a mock crypto.randomUUID for consistent testing
 */
export function mockRandomUUID(
  uuid: string = 'test-uuid-12345'
): jest.SpyInstance {
  return jest.spyOn(crypto, 'randomUUID').mockReturnValue(uuid);
}

/**
 * Creates a mock Math.random for consistent testing
 */
export function mockMathRandom(value: number = 0.5): jest.SpyInstance {
  return jest.spyOn(Math, 'random').mockReturnValue(value);
}

/**
 * Test data factory for creating consistent test objects
 */
export const testDataFactory = {
  user: (
    overrides: Partial<{ id: string; email: string; name: string }> = {}
  ) => ({
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    ...overrides,
  }),

  session: (
    overrides: Partial<{ id: string; userId: string; expiresAt: string }> = {}
  ) => ({
    id: 'session-456',
    userId: 'user-123',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  }),

  chatMessage: (
    overrides: Partial<{ id: string; role: string; content: string }> = {}
  ) => ({
    id: 'msg-789',
    role: 'user',
    content: 'Test message',
    timestamp: new Date().toISOString(),
    ...overrides,
  }),

  baziData: (
    overrides: Partial<{
      year: number;
      month: number;
      day: number;
      hour: number;
    }> = {}
  ) => ({
    year: 1990,
    month: 5,
    day: 15,
    hour: 14,
    gender: 'male' as const,
    timezone: 'Asia/Shanghai',
    ...overrides,
  }),

  conversationContext: (overrides: any = {}) => ({
    sessionId: 'session-123',
    userId: 'user-456',
    messages: [],
    userProfile: { preferences: {} },
    metadata: {
      analysisCount: 0,
      sessionStartedAt: new Date().toISOString(),
    },
    domainSnapshot: {},
    topicTags: [],
    ...overrides,
  }),
};

/**
 * Creates a mock timer for testing time-dependent code
 */
export function useMockTimer(): {
  advance: (ms: number) => void;
  restore: () => void;
} {
  jest.useFakeTimers();

  return {
    advance: (ms: number) => jest.advanceTimersByTime(ms),
    restore: () => jest.useRealTimers(),
  };
}

/**
 * Asserts that a function throws a specific error
 */
export async function expectToThrow(
  fn: () => Promise<any> | any,
  expectedError: string | RegExp | Error
): Promise<void> {
  try {
    await fn();
    throw new Error('Expected function to throw, but it did not');
  } catch (error) {
    if (typeof expectedError === 'string') {
      expect((error as any).message).toContain(expectedError);
    } else if (expectedError instanceof RegExp) {
      expect((error as any).message).toMatch(expectedError);
    } else if (expectedError instanceof Error) {
      expect(error).toEqual(expectedError);
    }
  }
}

/**
 * Creates a mock implementation that succeeds after a certain number of retries
 */
export function createRetryMock<T>(
  successValue: T,
  failuresBeforeSuccess: number = 2
): jest.MockedFunction<() => Promise<T>> {
  let attempts = 0;

  return jest.fn().mockImplementation(async () => {
    attempts++;
    if (attempts <= failuresBeforeSuccess) {
      throw new Error(`Attempt ${attempts} failed`);
    }
    return successValue;
  });
}

/**
 * Creates a mock database connection for testing
 */
export function createMockDatabase() {
  const mockQuery = jest.fn();
  const mockTransaction = jest.fn();
  const mockClose = jest.fn();

  return {
    query: mockQuery,
    transaction: mockTransaction,
    close: mockClose,
    // Helper to reset all mocks
    reset: () => {
      mockQuery.mockReset();
      mockTransaction.mockReset();
      mockClose.mockReset();
    },
  };
}

/**
 * Helper to assert API response structure
 */
export function assertApiResponse(
  response: any,
  expectedStructure: {
    success?: boolean;
    status?: number;
    data?: any;
    error?: any;
  }
): void {
  if (expectedStructure.success !== undefined) {
    expect(response.success).toBe(expectedStructure.success);
  }

  if (expectedStructure.data !== undefined) {
    expect(response.data).toBeDefined();
    if (typeof expectedStructure.data === 'object') {
      expect(response.data).toEqual(
        expect.objectContaining(expectedStructure.data)
      );
    }
  }

  if (expectedStructure.error !== undefined) {
    expect(response.error).toBeDefined();
    if (typeof expectedStructure.error === 'object') {
      expect(response.error).toEqual(
        expect.objectContaining(expectedStructure.error)
      );
    }
  }
}

// Placeholder test to satisfy Jest requirement for at least one test in the suite
test('test-helpers placeholder', () => {
  expect(true).toBe(true);
});
