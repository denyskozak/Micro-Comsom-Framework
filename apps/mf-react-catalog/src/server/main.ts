import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { renderCatalogHtml } from './render';
import { createDiscoveryClient } from '@cosmos/discovery-client';

const port = Number(process.env.MF_CATALOG_PORT ?? 4500);
const discoveryUrl = process.env.DISCOVERY_URL ?? 'http://localhost:4400';
const heartbeatMs = Number(process.env.MF_CATALOG_HEARTBEAT_MS ?? 10_000);

const instanceId = process.env.MF_INSTANCE_ID ?? `catalog-${randomUUID()}`;

const discoveryClient = createDiscoveryClient({ baseUrl: discoveryUrl });

const registrationPayload = {
  name: 'catalog',
  version: '0.1.0',
  basePath: '/catalog',
  ssrUrl: `http://localhost:${port}/ssr`,
  routes: ['/catalog', '/catalog/:id'],
  ttlSec: 30,
  instanceId,
  metadata: {
    team: 'commerce-platform',
    framework: 'react'
  }
} as const;

const register = async (): Promise<void> => {
  await discoveryClient.registerMicrofrontend(registrationPayload);
  console.log('[mf-react-catalog] registered with discovery service');
};

const sendHeartbeat = async (): Promise<void> => {
  await discoveryClient.heartbeat({
    name: registrationPayload.name,
    instanceId: registrationPayload.instanceId
  });
};

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://localhost:${port}`);

  if (request.method === 'GET' && url.pathname === '/health') {
    response.statusCode = 200;
    response.setHeader('content-type', 'application/json');
    response.end(JSON.stringify({ status: 'ok', service: 'mf-react-catalog' }));
    return;
  }

  if (request.method === 'GET' && url.pathname === '/ssr') {
    const route = url.searchParams.get('route') ?? '/catalog';
    const html = renderCatalogHtml(route);

    response.statusCode = 200;
    response.setHeader('content-type', 'application/json');
    response.end(JSON.stringify({ html }));
    return;
  }

  response.statusCode = 404;
  response.end('Not Found');
});

server.listen(port, async () => {
  console.log(`[mf-react-catalog] listening on http://localhost:${port}`);

  try {
    await register();
  } catch (error) {
    console.error('[mf-react-catalog] failed to register on startup', error);
  }

  setInterval(async () => {
    try {
      await sendHeartbeat();
    } catch (error) {
      console.error('[mf-react-catalog] heartbeat failed', error);
    }
  }, heartbeatMs).unref();
});
