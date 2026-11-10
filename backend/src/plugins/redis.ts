/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT                  │
 * │  ──────────────────────────────────────────────────────────────────   │
 * │  File      : backend/src/plugins/redis.ts                           │
 * │  Purpose   : Plugin: redis                                          │
 * │  Author    : Jack — Jack[at]SatuRumah[dot]Net                      │
 * │  GitHub    : https://github.com/setuju                            │
 * │  Website   : https://saturumah.net                              │
 * │  Created   : 10-11-2026                                             │
 * │  License   : MIT                                                  │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   10-11-2026
 * @package   financial-os/backend
 * @license   MIT
 */

import fp from 'fastify-plugin';
import { Redis } from 'ioredis';
import type { FastifyInstance } from 'fastify';
import { config } from '../config';

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis;
  }
}

export default fp(
  async (app: FastifyInstance) => {
    const client = new Redis(config.redisUrl, {
      lazyConnect: false,
      connectTimeout: 2_000,
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => Math.min(times * 200, 2_000),
    });
    app.decorate('redis', client);
    app.addHook('onClose', async () => {
      client.disconnect();
    });
  },
  { name: 'redis' }
);
