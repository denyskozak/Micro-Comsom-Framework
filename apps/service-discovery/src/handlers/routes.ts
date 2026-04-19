import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  manifestResponseSchema,
  microfrontendHeartbeatSchema,
  microfrontendListResponseSchema,
  microfrontendRegistrationSchema
} from '@cosmos/discovery-contracts';
import { readJsonBody, sendJson } from '../utils/http';
import { sendValidationError } from './errors';
import { ZodError } from 'zod';
import type { MicrofrontendRegistry } from '../registry/store';

export const handleRegister = async (
  request: IncomingMessage,
  response: ServerResponse,
  registry: MicrofrontendRegistry
): Promise<void> => {
  try {
    const body = await readJsonBody(request);
    const registration = microfrontendRegistrationSchema.parse(body);
    const entry = registry.upsert(registration);

    sendJson(response, 200, { registered: true, entry });
  } catch (error) {
    if (error instanceof ZodError) {
      sendValidationError(response, error);
      return;
    }

    throw error;
  }
};

export const handleHeartbeat = async (
  request: IncomingMessage,
  response: ServerResponse,
  registry: MicrofrontendRegistry
): Promise<void> => {
  try {
    const body = await readJsonBody(request);
    const heartbeat = microfrontendHeartbeatSchema.parse(body);
    const updated = registry.heartbeat(heartbeat.name, heartbeat.instanceId);

    if (!updated) {
      sendJson(response, 404, {
        error: {
          code: 'INSTANCE_NOT_FOUND',
          message: 'No matching instance found for heartbeat.'
        }
      });
      return;
    }

    sendJson(response, 200, { heartbeat: true, entry: updated });
  } catch (error) {
    if (error instanceof ZodError) {
      sendValidationError(response, error);
      return;
    }

    throw error;
  }
};

export const handleMicrofrontends = (response: ServerResponse, registry: MicrofrontendRegistry): void => {
  const payload = microfrontendListResponseSchema.parse({
    microfrontends: registry.listActive()
  });

  sendJson(response, 200, payload);
};

export const handleManifest = (response: ServerResponse, registry: MicrofrontendRegistry): void => {
  const payload = manifestResponseSchema.parse({
    generatedAt: new Date().toISOString(),
    entries: registry.listActive()
  });

  sendJson(response, 200, payload);
};

export const handleHealth = (response: ServerResponse): void => {
  sendJson(response, 200, {
    status: 'ok',
    service: 'service-discovery',
    timestamp: new Date().toISOString()
  });
};
