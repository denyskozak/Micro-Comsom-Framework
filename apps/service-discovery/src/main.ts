import { createServer } from 'node:http';
import {
  handleHealth,
  handleHeartbeat,
  handleManifest,
  handleMicrofrontends,
  handleRegister
} from './handlers/routes';
import { sendInternalError, sendNotFound } from './handlers/errors';
import { MicrofrontendRegistry } from './registry/store';

const port = Number(process.env.SERVICE_DISCOVERY_PORT ?? 4400);
const cleanupIntervalMs = Number(process.env.SERVICE_DISCOVERY_CLEANUP_MS ?? 5_000);

const registry = new MicrofrontendRegistry();

setInterval(() => {
  registry.pruneExpired();
}, cleanupIntervalMs).unref();

const server = createServer(async (request, response) => {
  try {
    const method = request.method ?? 'GET';
    const url = request.url ?? '/';

    if (method === 'GET' && url === '/health') {
      handleHealth(response);
      return;
    }

    if (method === 'POST' && url === '/register') {
      await handleRegister(request, response, registry);
      return;
    }

    if (method === 'POST' && url === '/heartbeat') {
      await handleHeartbeat(request, response, registry);
      return;
    }

    if (method === 'GET' && url === '/microfrontends') {
      handleMicrofrontends(response, registry);
      return;
    }

    if (method === 'GET' && url === '/manifest') {
      handleManifest(response, registry);
      return;
    }

    sendNotFound(response);
  } catch (error) {
    sendInternalError(response, error);
  }
});

server.listen(port, () => {
  console.log(`[service-discovery] listening on http://localhost:${port}`);
});
