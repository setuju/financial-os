import fp from 'fastify-plugin';
import { Pool } from 'pg';
import type { FastifyInstance } from 'fastify';
import { config } from '../config';

declare module 'fastify' {
  interface FastifyInstance {
    pg: Pool;
  }
}

export default fp(
  async (app: FastifyInstance) => {
    const pool = new Pool({
      connectionString: config.databaseUrl,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
    app.decorate('pg', pool);
    app.addHook('onClose', async () => {
      await pool.end();
    });
  },
  { name: 'db' }
);
