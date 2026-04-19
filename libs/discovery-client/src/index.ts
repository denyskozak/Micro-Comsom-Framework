import {
  microfrontendHeartbeatSchema,
  microfrontendRegistrationSchema,
  type MicrofrontendHeartbeat,
  type MicrofrontendRegistration
} from '@cosmos/discovery-contracts';

export type DiscoveryClientConfig = {
  baseUrl: string;
  fetchImpl?: typeof fetch;
};

const jsonHeaders = { 'content-type': 'application/json' };

export class DiscoveryClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(config: DiscoveryClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.fetchImpl = config.fetchImpl ?? fetch;
  }

  async registerMicrofrontend(payload: MicrofrontendRegistration): Promise<void> {
    const validatedPayload = microfrontendRegistrationSchema.parse(payload);
    await this.post('/register', validatedPayload);
  }

  async heartbeat(payload: MicrofrontendHeartbeat): Promise<void> {
    const validatedPayload = microfrontendHeartbeatSchema.parse(payload);
    await this.post('/heartbeat', validatedPayload);
  }

  private async post(path: string, body: unknown): Promise<void> {
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(`Discovery request failed (${response.status}): ${responseText}`);
    }
  }
}

export const createDiscoveryClient = (config: DiscoveryClientConfig) => new DiscoveryClient(config);
