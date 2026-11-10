/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : backend/src/server.ts
 * │  Purpose   : Backend: server
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

import Fastify from 'fastify';
import cors from '@fastify/cors';
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
import assistantRoutes from './routes/assistant';
import receiptsRoutes from './routes/receipts';

export async function buildServer(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: { level: config.logLevel },
  });
  await app.register(cors, {
    origin: [
      'https://financial-os-nu.vercel.app',
      'https://financial.saturumah.net',
      'https://financial-api.saturumah.net',
      'http://localhost:3000',
      /\.vercel\.app$/,
      /\.saturumah\.net$/,
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: false,
    maxAge: 86400,
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
  await app.register(assistantRoutes);
  await app.register(receiptsRoutes);
  return app;
}
