import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { config } from './config';
import dbPlugin from './plugins/db';
import elasticPlugin from './plugins/elastic';
import redisPlugin from './plugins/redis';
import healthRoutes from './routes/health';
import surplusRoutes from './routes/surplus';
import impactRoutes from './routes/impact';
import transactionsRoutes from './routes/transactions';
import reportsRoutes from './routes/reports';
import goalsRoutes from './routes/goals';

export async function buildServer(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: { level: config.logLevel },
  });
  await app.register(dbPlugin);
  await app.register(elasticPlugin);
  await app.register(redisPlugin);
  await app.register(healthRoutes);
  await app.register(surplusRoutes);
  await app.register(impactRoutes);
  await app.register(transactionsRoutes);
  await app.register(reportsRoutes);
  await app.register(goalsRoutes);
  return app;
}
