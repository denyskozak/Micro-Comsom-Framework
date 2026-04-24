import type { MiddlewareHandler } from 'astro';
import { manifestResponseSchema } from '@cosmos/discovery-contracts';
import type { MicrofrontendManifestEntry } from '@cosmos/discovery-contracts';

const discoveryUrl = (import.meta.env.DISCOVERY_URL as string | undefined) ?? 'http://localhost:4400';

const getSlot = (entry: MicrofrontendManifestEntry): string => {
  const rawSlot = entry.metadata?.slot;
  return typeof rawSlot === 'string' ? rawSlot : 'content';
};

// Request-time lookup: every incoming shell request asks service discovery
// for the latest manifest so composition is data-driven instead of hardcoded.
export const onRequest: MiddlewareHandler = async ({ locals }, next) => {
  try {
    const response = await fetch(`${discoveryUrl}/manifest`);
    const manifestPayload = await response.json();
    locals.manifest = manifestResponseSchema.parse(manifestPayload);
    locals.connectedMicrofrontends = locals.manifest.entries.map((entry) => ({
      name: entry.name,
      basePath: entry.basePath,
      slot: getSlot(entry),
      ssrUrl: entry.ssrUrl
    }));
  } catch {
    locals.manifest = { generatedAt: new Date().toISOString(), entries: [] };
    locals.connectedMicrofrontends = [];
  }

  return next();
};
