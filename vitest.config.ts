import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    
    // 排除不应该由 Vitest 运行的文件
    exclude: [
      '**/node_modules/**',
      '**/.archived/**',      // 排除归档目录
      '**/e2e/**',            // E2E 测试用 Playwright
      '**/tests/e2e/**',      // E2E 测试目录
      '**/*.spec.ts',         // Playwright 测试文件
      '**/dist/**',
      '**/.next/**',
    ],
    
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        'e2e/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/**',
        '**/.next/**',
        '**/dist/**',
        '**/build/**',
        '**/.archived/**',      // 排除归档目录
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
    // 测试超时设置
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '~': path.resolve(__dirname, './src'),
    },
  },
});
