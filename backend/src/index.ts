import { buildServer } from './server';
import { config } from './config';

const app = await buildServer();

try {
  await app.listen({ port: config.port, host: config.host });
  app.log.info(`Financial OS backend listening on http://${config.host}:${config.port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
