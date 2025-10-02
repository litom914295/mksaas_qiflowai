/**
 * @jest-environment node
 */
import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn()
}));

// Mock the config
jest.mock('@/lib/i18n/config', () => ({
  locales: ['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'ms'],
  defaultLocale: 'zh-CN'
}));

// Mock locale files
jest.mock('@/locales/zh-CN.json', () => ({
  default: { common: { loading: '加载中...' } }
}), { virtual: true });

jest.mock('@/locales/en.json', () => ({
  default: { common: { loading: 'Loading...' } }
}), { virtual: true });

describe('i18n request configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load messages for valid locale', async () => {
    // This test would need to be implemented based on how getRequestConfig is used
    // The actual implementation depends on next-intl's testing patterns
  });

  it('should call notFound for invalid locale', async () => {
    // Test implementation for invalid locale handling
  });

  it('should fallback to default locale on error', async () => {
    // Test implementation for fallback behavior
  });

  it('should handle complete failure gracefully', async () => {
    // Test implementation for complete failure scenario
  });
});