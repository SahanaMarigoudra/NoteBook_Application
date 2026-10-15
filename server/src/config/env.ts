import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().default(10000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_ACCESS_SECRET: z.string().min(16).default('notespace_production_access_secret_789xyz123abc_secure'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_SECRET: z.string().min(16).default('notespace_production_refresh_secret_456uvw012def_secure'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  CLIENT_ORIGIN: z.string().default('*'),
  LOG_LEVEL: z.string().default('info'),
  BCRYPT_ROUNDS: z.coerce.number().default(12),
});

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ Invalid environment variables:');
  for (const issue of parseResult.error.issues) {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parseResult.data;
export type Env = typeof env;
