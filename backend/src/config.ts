/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : backend/src/config.ts
 * │  Purpose   : Backend: config
 * │  Author    : Jack — Jack[at]SatuRumah[dot]Net
 * │  GitHub    : https://github.com/setuju
 * │  Website   : https://saturumah.net
 * │  Created   : 10-11-2026
 * │  License   : MIT
 * └────────────────────────────────────────────────────────────────────┘
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   10-11-2026
 * @package   financial-os/backend
 * @license   MIT
 */

/**
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   10-11-2026
 * @package   financial-os/backend
 * @license   MIT
 */

import dotenv from 'dotenv';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';

function findEnvFile(): string | undefined {
  const candidates = [
    process.env.ENV_FILE,
    resolve(process.cwd(), '../infra/.env'),
    resolve(process.cwd(), 'infra/.env'),
    resolve(process.cwd(), '.env'),
  ].filter((p): p is string => typeof p === 'string' && p.length > 0);
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return undefined;
}

const envFile = findEnvFile();
if (envFile) {
  dotenv.config({ path: envFile, override: false });
}

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.length === 0) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 3001),
  host: process.env.HOST ?? '0.0.0.0',
  logLevel: process.env.LOG_LEVEL ?? 'info',
  databaseUrl: required('DATABASE_URL'),
  redisUrl: required('REDIS_URL'),
  elasticUrl: required('ELASTIC_URL'),
  elasticApiKey: required('ELASTIC_API_KEY'),
} as const;
