/**
 * Jest配置 - 八字模块测试专用
 */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/lib/bazi', '<rootDir>/src/lib/bazi-pro'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: [
    'src/lib/bazi/**/*.{ts,tsx}',
    'src/lib/bazi-pro/**/*.{ts,tsx}',
    '!src/lib/bazi/**/*.d.ts',
    '!src/lib/bazi-pro/**/*.d.ts',
    '!src/lib/bazi/**/__tests__/**',
    '!src/lib/bazi-pro/**/__tests__/**',
  ],
  coverageDirectory: 'coverage/bazi',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  verbose: true,
  testTimeout: 10000,
};
