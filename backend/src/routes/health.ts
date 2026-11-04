import type { FastifyInstance } from 'fastify';

const PROBE_TIMEOUT_MS = 3_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`probe timeout after ${ms}ms`)),
      ms
    );
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      }
    );
  });
}

export default async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async (_request, reply) => {
    const started = Date.now();

    const [pgOk, redisOk] = await Promise.all([
      withTimeout(app.pg.query('SELECT 1'), PROBE_TIMEOUT_MS)
        .then(() => true)
        .catch((err) => {
          app.log.warn({ err }, 'pg health probe failed');
          return false;
        }),
      withTimeout(app.redis.ping(), PROBE_TIMEOUT_MS)
        .then((pong) => pong === 'PONG')
        .catch((err) => {
          app.log.warn({ err }, 'redis health probe failed');
          return false;
        }),
    ]);

    const healthy = pgOk && redisOk;
    return reply.code(healthy ? 200 : 503).send({
      status: healthy ? 'ok' : 'degraded',
      pg: pgOk ? 'ok' : 'fail',
      redis: redisOk ? 'ok' : 'fail',
      uptime: Math.round(process.uptime()),
      latencyMs: Date.now() - started,
    });
  });
}
