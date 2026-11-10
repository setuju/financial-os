/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : backend/src/plugins/elastic.ts
 * │  Purpose   : Plugin: elastic
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

    // Buat index jika belum ada (opsional, error diabaikan jika sudah ada)
    try {
      await client.indices.create({
        index: 'transactions',
        mappings: {
          properties: {
            raw_text: { type: 'text' },
            category: { type: 'keyword' },
            type: { type: 'keyword' },
            amount: { type: 'float' },
            occurred_at: { type: 'date' },
          },
        },
      });
      app.log.info('Elasticsearch index "transactions" created');
    } catch (err: any) {
      // Error 400 resource_already_exists_exception diabaikan
      if (!(err.meta && err.meta.statusCode === 400)) {
        app.log.error('Failed to create Elastic index', err);
      }
    }

    app.addHook('onClose', async () => {
      await client.close();
    });
  },
  { name: 'elastic' }
);
