import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { config } from './config';
import dbPlugin from './plugins/db';
import redisPlugin from './plugins/redis';
import healthRoutes from './routes/health';

export async function buildServer(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: { level: config.logLevel },
  });
  await app.register(dbPlugin);
  await app.register(redisPlugin);
  await app.register(healthRoutes);
  return app;
}
