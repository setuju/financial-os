/**
 * Demo session endpoints — signup, login, reset.
 * No real auth. 5-char password. Admin (name='admin') owns seeded baseline.
 */
import type { FastifyPluginAsync } from 'fastify';
import {
  ADMIN_UUID,
  registerSession,
  verifyLogin,
  verifySession,
} from '../repositories/demo-sessions.js';
import { runSeed } from '../lib/seed-runner.js';

interface SignupBody {
  name: string;
}
interface LoginBody {
  name: string;
  password: string;
}

const demoRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: SignupBody }>(
    '/demo/signup',
    {
      schema: {
        body: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 40 },
          },
        },
      },
    },
    async (req, reply) => {
      try {
        const { session, password } = await registerSession(fastify.pg, req.body.name);
        return reply.code(201).send({
          sessionId: session.id,
          name: session.name,
          password,
          is_admin: false,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'unknown';
        if (msg === 'name_taken') {
          return reply.code(409).send({ error: 'name_taken', message: 'Name already in use. Try another.' });
        }
        if (msg === 'name_reserved') {
          return reply.code(400).send({ error: 'name_reserved', message: 'That name is reserved.' });
        }
        if (msg === 'name_invalid') {
          return reply.code(400).send({ error: 'name_invalid', message: 'Name must be 2-40 chars.' });
        }
        req.log.error({ err }, 'signup failed');
        return reply.code(500).send({ error: 'signup_failed' });
      }
    },
  );

  fastify.post<{ Body: LoginBody }>(
    '/demo/login',
    {
      schema: {
        body: {
          type: 'object',
          required: ['name', 'password'],
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 40 },
            password: { type: 'string', minLength: 1, maxLength: 32 },
          },
        },
      },
    },
    async (req, reply) => {
      const session = await verifyLogin(fastify.pg, req.body.name, req.body.password);
      if (!session) {
        return reply.code(401).send({ error: 'invalid_credentials' });
      }
      return {
        sessionId: session.id,
        name: session.name,
        is_admin: session.is_admin,
      };
    },
  );

  fastify.post('/demo/reset', async (req, reply) => {
    // Explicit session check (permissive hook falls back to admin; reject if header missing/invalid)
    const rawSid = req.headers['x-session-id'];
    if (typeof rawSid !== 'string' || rawSid.length === 0) {
      return reply.code(401).send({ error: 'session_required' });
    }
    const session = await verifySession(fastify.pg, rawSid);
    if (!session) {
      return reply.code(401).send({ error: 'invalid_session' });
    }
    const isAdmin = session.id === ADMIN_UUID;
    try {
      const result = await runSeed(fastify.pg, session.id, { withData: isAdmin }, fastify.elastic);
      return {
        ok: true,
        sessionId: session.id,
        is_admin: isAdmin,
        ...result,
      };
    } catch (err) {
      req.log.error({ err }, 'reset failed');
      return reply.code(500).send({
        error: 'reset_failed',
        message: err instanceof Error ? err.message : 'unknown',
      });
    }
  });
};

export default demoRoutes;
