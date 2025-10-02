/**
 * Environment Variable Type Definitions
 * Provides strict typing and validation for all environment variables used in QiFlow AI
 */

import { z } from 'zod';

/**
 * Environment validation schemas using Zod
 */
export const EnvSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().min(1),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(100), // JWT tokens are typically 100+ chars
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(100),
  
  // AI Provider Keys (all optional)
  OPENAI_API_KEY: z.string().regex(/^sk-(proj-)?[A-Za-z0-9]{48,64}$/).optional(),
  OPENAI_BASE_URL: z.string().url().optional(),
  
  ANTHROPIC_API_KEY: z.string().regex(/^sk-ant-[A-Za-z0-9\-_]+$/).optional(),
  ANTHROPIC_BASE_URL: z.string().url().optional(),
  
  GEMINI_API_KEY: z.string().min(20).optional(),
  GEMINI_BASE_URL: z.string().url().optional(),
  
  DEEPSEEK_API_KEY: z.string().min(20).optional(),
  DEEPSEEK_BASE_URL: z.string().url().optional(),
  
  // Authentication
  GUEST_SESSION_SECRET: z.string().min(32),
  NEXTAUTH_SECRET: z.string().min(32).optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  
  // Stripe (optional)
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // Application Configuration
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  DATABASE_URL: z.string().url().optional(),
  
  // Feature Flags
  ENABLE_AI_FEATURES: z.enum(['true', 'false']).default('true').transform(val => val === 'true'),
  ENABLE_GUEST_MODE: z.enum(['true', 'false']).default('true').transform(val => val === 'true'),
  ENABLE_DEBUG_MODE: z.enum(['true', 'false']).default('false').transform(val => val === 'true'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().regex(/^\d+$/).transform(Number).default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().regex(/^\d+$/).transform(Number).default(100),
  
  // Monitoring & Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  SENTRY_DSN: z.string().url().optional(),
});

/**
 * Validated environment variables type (inferred from schema)
 */
export type ValidatedEnv = z.infer<typeof EnvSchema>;

/**
 * Raw environment variables (before validation)
 */
export type RawEnv = Record<string, string | undefined>;

/**
 * Environment validation result
 */
export interface EnvValidationResult {
  success: boolean;
  data?: ValidatedEnv;
  errors?: string[];
}

/**
 * AI Provider configuration types
 */
export interface AIProviderConfig {
  name: 'openai' | 'anthropic' | 'gemini' | 'deepseek';
  apiKey: string;
  baseURL?: string;
  enabled: boolean;
}

/**
 * Database configuration types
 */
export interface DatabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
  isProduction: boolean;
}

/**
 * Application configuration types
 */
export interface AppConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
  appUrl: string;
  enableAI: boolean;
  enableGuestMode: boolean;
  debugMode: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
}

/**
 * Stripe configuration (optional)
 */
export interface StripeConfig {
  publishableKey?: string;
  secretKey?: string;
  webhookSecret?: string;
  enabled: boolean;
}

/**
 * Type guard for checking if all required AI providers are configured
 */
export interface AIProvidersStatus {
  openai: boolean;
  anthropic: boolean;
  gemini: boolean;
  deepseek: boolean;
  hasAnyProvider: boolean;
  availableProviders: string[];
}

/**
 * Environment-specific type unions for better type safety
 */
export type NodeEnvironment = 'development' | 'production' | 'test';
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';
export type AIProviderName = 'openai' | 'anthropic' | 'gemini' | 'deepseek';

/**
 * Conditional types for environment-specific configuration
 */
export type ProductionRequiredKeys = 'SUPABASE_SERVICE_ROLE_KEY' | 'GUEST_SESSION_SECRET';
export type DevelopmentOptionalKeys = 'NEXTAUTH_SECRET' | 'NEXTAUTH_URL';

/**
 * Environment-specific configuration type
 */
export type EnvConfig<T extends NodeEnvironment> = T extends 'production'
  ? Required<Pick<ValidatedEnv, ProductionRequiredKeys>> & ValidatedEnv
  : ValidatedEnv;

/**
 * Feature flag types with proper typing
 */
export interface FeatureFlags {
  aiFeatures: boolean;
  guestMode: boolean;
  debugMode: boolean;
  stripeIntegration: boolean;
  sentryLogging: boolean;
}

/**
 * Type for environment variable access with proper error handling
 */
export interface EnvAccessor {
  get<K extends keyof ValidatedEnv>(key: K): ValidatedEnv[K];
  getOptional<K extends keyof ValidatedEnv>(key: K): ValidatedEnv[K] | undefined;
  has<K extends keyof ValidatedEnv>(key: K): boolean;
  isDefined<K extends keyof ValidatedEnv>(key: K): boolean;
  getAIProviders(): AIProvidersStatus;
  getDatabaseConfig(): DatabaseConfig;
  getAppConfig(): AppConfig;
  getRateLimitConfig(): RateLimitConfig;
  getStripeConfig(): StripeConfig;
  getFeatureFlags(): FeatureFlags;
}

/**
 * Validation error types
 */
export class EnvValidationError extends Error {
  constructor(
    message: string,
    public readonly errors: string[],
    public readonly field?: string
  ) {
    super(message);
    this.name = 'EnvValidationError';
  }
}

/**
 * Missing required environment variable error
 */
export class MissingEnvError extends Error {
  constructor(
    public readonly variable: string,
    public readonly environment: NodeEnvironment
  ) {
    super(`Missing required environment variable: ${variable} (${environment} mode)`);
    this.name = 'MissingEnvError';
  }
}

/**
 * Invalid environment variable format error
 */
export class InvalidEnvFormatError extends Error {
  constructor(
    public readonly variable: string,
    public readonly expectedFormat: string,
    public readonly actualValue: string
  ) {
    super(`Invalid format for ${variable}. Expected: ${expectedFormat}, Got: ${actualValue}`);
    this.name = 'InvalidEnvFormatError';
  }
}

/**
 * Brand types for additional type safety
 */
export type SupabaseURL = string & { readonly __brand: 'SupabaseURL' };
export type APIKey = string & { readonly __brand: 'APIKey' };
export type JWTToken = string & { readonly __brand: 'JWTToken' };
export type SecretKey = string & { readonly __brand: 'SecretKey' };

/**
 * Branded constructor functions
 */
export const createSupabaseURL = (url: string): SupabaseURL => url as SupabaseURL;
export const createAPIKey = (key: string): APIKey => key as APIKey;
export const createJWTToken = (token: string): JWTToken => token as JWTToken;
export const createSecretKey = (secret: string): SecretKey => secret as SecretKey;