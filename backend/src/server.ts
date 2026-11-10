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
import { ensureAdminSession } from './repositories/demo-sessions.js';
import { verifySession } from './repositories/demo-sessions.js';
import { ADMIN_UUID } from './repositories/demo-sessions.js';

declare module 'fastify' {
  interface FastifyRequest {
    sessionId: string;
  }
}

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

  // B3: attachSession hook — req.sessionId from X-Session-Id header (fallback ADMIN_UUID)
  app.decorateRequest('sessionId', '');
  app.addHook('preHandler', async (req) => {
    const hdr = req.headers['x-session-id'];
    if (typeof hdr === 'string' && hdr.length > 0) {
      const s = await verifySession(app.pg, hdr);
      if (s) {
        req.sessionId = s.id;
        return;
      }
    }
    req.sessionId = ADMIN_UUID;
  });
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
    // Multi-tenant: ensure admin session exists (idempotent)
  await ensureAdminSession(app.pg);

return app;
}
