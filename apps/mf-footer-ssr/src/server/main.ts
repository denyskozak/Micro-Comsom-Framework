import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { createDiscoveryClient } from '@cosmos/discovery-client';
import { renderFooterHtml } from './render';

const port = Number(process.env.MF_FOOTER_PORT ?? 4502);
const discoveryUrl = process.env.DISCOVERY_URL ?? 'http://localhost:4400';
const heartbeatMs = Number(process.env.MF_FOOTER_HEARTBEAT_MS ?? 10_000);

const instanceId = process.env.MF_INSTANCE_ID ?? `footer-${randomUUID()}`;
const discoveryClient = createDiscoveryClient({ baseUrl: discoveryUrl });

const registrationPayload = {
  name: 'footer',
  version: '0.1.0',
  basePath: '/',
  ssrUrl: `http://localhost:${port}/ssr`,
  routes: ['/'],
  ttlSec: 30,
  instanceId,
  metadata: {
    slot: 'footer',
    global: true,
    framework: 'react-router-ssr'
  }
};

const register = async (): Promise<void> => {
  await discoveryClient.registerMicrofrontend(registrationPayload);
  console.log('[mf-footer-ssr] registered with discovery service');
};

const sendHeartbeat = async (): Promise<void> => {
  await discoveryClient.heartbeat({ name: registrationPayload.name, instanceId: registrationPayload.instanceId });
};

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://localhost:${port}`);

  if (request.method === 'GET' && url.pathname === '/health') {
    response.statusCode = 200;
    response.setHeader('content-type', 'application/json');
    response.end(JSON.stringify({ status: 'ok', service: 'mf-footer-ssr' }));
    return;
  }

  if (request.method === 'GET' && url.pathname === '/ssr') {
    const route = url.searchParams.get('route') ?? '/';

    response.statusCode = 200;
    response.setHeader('content-type', 'application/json');
    response.end(JSON.stringify({ html: renderFooterHtml(route) }));
    return;
  }

  response.statusCode = 404;
  response.end('Not Found');
});

server.listen(port, async () => {
  console.log(`[mf-footer-ssr] listening on http://localhost:${port}`);
  try {
    await register();
  } catch (error) {
    console.error('[mf-footer-ssr] failed to register on startup', error);
  }

  setInterval(async () => {
    try {
      await sendHeartbeat();
    } catch (error) {
      console.error('[mf-footer-ssr] heartbeat failed', error);
    }
  }, heartbeatMs).unref();
});
