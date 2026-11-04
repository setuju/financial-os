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
