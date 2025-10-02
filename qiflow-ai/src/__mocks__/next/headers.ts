// Mock Next.js headers for testing
export const cookies = () => ({
  get: (name: string) => ({
    name,
    value: 'test-cookie-value',
  }),
  set: (name: string, value: string) => {},
  delete: (name: string) => {},
  getAll: () => [],
  has: (name: string) => false,
});

export const headers = () => ({
  get: (name: string) => null,
  set: (name: string, value: string) => {},
  delete: (name: string) => {},
  has: (name: string) => false,
  entries: () => [],
  keys: () => [],
  values: () => [],
  forEach: (callback: (value: string, key: string) => void) => {},
});









