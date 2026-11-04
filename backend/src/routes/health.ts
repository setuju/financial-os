import type { FastifyInstance } from 'fastify';

export default async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async (_request, reply) => {
    let pgOk = false;
    let redisOk = false;

    try {
      await app.pg.query('SELECT 1');
      pgOk = true;
    } catch (err) {
      app.log.warn({ err }, 'pg health probe failed');
    }

    try {
      const pong = await app.redis.ping();
      redisOk = pong === 'PONG';
    } catch (err) {
      app.log.warn({ err }, 'redis health probe failed');
    }

    const healthy = pgOk && redisOk;
    return reply.code(healthy ? 200 : 503).send({
      status: healthy ? 'ok' : 'degraded',
      pg: pgOk ? 'ok' : 'fail',
      redis: redisOk ? 'ok' : 'fail',
      uptime: Math.round(process.uptime()),
    });
  });
}
