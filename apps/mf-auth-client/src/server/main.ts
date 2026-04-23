import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { createDiscoveryClient } from '@cosmos/discovery-client';
import { renderAuthHtml } from './render';

const port = Number(process.env.MF_AUTH_PORT ?? 4503);
const discoveryUrl = process.env.DISCOVERY_URL ?? 'http://localhost:4400';
const heartbeatMs = Number(process.env.MF_AUTH_HEARTBEAT_MS ?? 10_000);

const instanceId = process.env.MF_INSTANCE_ID ?? `auth-${randomUUID()}`;
const discoveryClient = createDiscoveryClient({ baseUrl: discoveryUrl });

const registrationPayload = {
  name: 'auth',
  version: '0.1.0',
  basePath: '/',
  ssrUrl: `http://localhost:${port}/ssr`,
  routes: ['/'],
  ttlSec: 30,
  instanceId,
  metadata: {
    slot: 'auth',
    global: true,
    framework: 'ssr-html'
  }
};

const register = async (): Promise<void> => {
  await discoveryClient.registerMicrofrontend(registrationPayload);
  console.log('[mf-auth-client] registered with discovery service');
};

const sendHeartbeat = async (): Promise<void> => {
  await discoveryClient.heartbeat({ name: registrationPayload.name, instanceId: registrationPayload.instanceId });
};

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://localhost:${port}`);

  if (request.method === 'GET' && url.pathname === '/health') {
    response.statusCode = 200;
    response.setHeader('content-type', 'application/json');
    response.end(JSON.stringify({ status: 'ok', service: 'mf-auth-client' }));
    return;
  }

  if (request.method === 'GET' && url.pathname === '/ssr') {
    response.statusCode = 200;
    response.setHeader('content-type', 'application/json');
    response.end(JSON.stringify({ html: renderAuthHtml() }));
    return;
  }

  response.statusCode = 404;
  response.end('Not Found');
});

server.listen(port, async () => {
  console.log(`[mf-auth-client] listening on http://localhost:${port}`);
  try {
    await register();
  } catch (error) {
    console.error('[mf-auth-client] failed to register on startup', error);
  }

  setInterval(async () => {
    try {
      await sendHeartbeat();
    } catch (error) {
      console.error('[mf-auth-client] heartbeat failed', error);
    }
  }, heartbeatMs).unref();
});
