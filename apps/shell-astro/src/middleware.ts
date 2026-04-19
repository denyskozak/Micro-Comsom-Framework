import type { MiddlewareHandler } from 'astro';
import { manifestResponseSchema } from '@cosmos/discovery-contracts';

const discoveryUrl = (import.meta.env.DISCOVERY_URL as string | undefined) ?? 'http://localhost:4400';

// Request-time lookup: every incoming shell request asks service discovery
// for the latest manifest so composition is data-driven instead of hardcoded.
export const onRequest: MiddlewareHandler = async ({ locals }, next) => {
  try {
    const response = await fetch(`${discoveryUrl}/manifest`);
    const manifestPayload = await response.json();
    locals.manifest = manifestResponseSchema.parse(manifestPayload);
  } catch {
    locals.manifest = { generatedAt: new Date().toISOString(), entries: [] };
  }

  return next();
};
