import { loadEnvConfig } from '@next/env';
import { defineConfig } from 'drizzle-kit';

// Load Next.js environment variables
loadEnvConfig(process.cwd());

/**
 * https://orm.drizzle.team/docs/get-started/neon-new#step-5---setup-drizzle-config-file
 */
export default defineConfig({
  out: './src/db/migrations',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL!,
  },
});
