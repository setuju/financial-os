/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : backend/src/plugins/elastic.ts
 * │  Purpose   : Elasticsearch client & index initialization
 * │  Author    : Jack — Jack[at]SatuRumah[dot]Net
 * │  Created   : 12-11-2026
 * │  License   : MIT
 * └────────────────────────────────────────────────────────────────────┘
 */
import fp from 'fastify-plugin';
import { Client } from '@elastic/elasticsearch';
import type { FastifyInstance } from 'fastify';
import { config } from '../config';

declare module 'fastify' {
  interface FastifyInstance {
    elastic: Client;
  }
}

export default fp(
  async (app: FastifyInstance) => {
    const client = new Client({
      node: config.elasticUrl,
      auth: {
        apiKey: config.elasticApiKey,
      },
    });
    app.decorate('elastic', client);

    try {
      const indexExists = await client.indices.exists({ index: 'transactions' });
      if (indexExists) {
        await client.indices.delete({ index: 'transactions' });
        app.log.info('Elasticsearch index "transactions" deleted for recreation');
      }
      await client.indices.create({
        index: 'transactions',
        mappings: {
          properties: {
            raw_text: { type: 'text', analyzer: 'standard' },
            category: { type: 'keyword' },
            type: { type: 'keyword' },
            amount: { type: 'float' },
            occurred_at: { type: 'date' },
            session_id: { type: 'keyword' },
          },
        },
      });
      app.log.info('Elasticsearch index "transactions" created');
    } catch (err: any) {
      app.log.error('Failed to create Elastic index', err);
    }

    app.addHook('onClose', async () => {
      await client.close();
    });
  },
  { name: 'elastic' }
);
