import { z } from 'zod';

export const routePatternSchema = z.string().min(1).startsWith('/');

export const microfrontendRegistrationSchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
  basePath: z.string().startsWith('/'),
  ssrUrl: z.string().url(),
  routes: z.array(routePatternSchema).min(1),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  ttlSec: z.number().int().positive().max(300),
  instanceId: z.string().min(1)
});

export const microfrontendHeartbeatSchema = z.object({
  name: z.string().min(1),
  instanceId: z.string().min(1)
});

export const microfrontendManifestEntrySchema = z.object({
  name: z.string(),
  version: z.string(),
  instanceId: z.string(),
  basePath: z.string(),
  ssrUrl: z.string().url(),
  routes: z.array(routePatternSchema),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  registeredAt: z.string().datetime(),
  expiresAt: z.string().datetime()
});

export const microfrontendListResponseSchema = z.object({
  microfrontends: z.array(microfrontendManifestEntrySchema)
});

export const manifestResponseSchema = z.object({
  generatedAt: z.string().datetime(),
  entries: z.array(microfrontendManifestEntrySchema)
});

export type ManifestResponseSchema =  z.infer<typeof manifestResponseSchema>;

export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    issues: z.unknown().optional()
  })
});

export type MicrofrontendRegistration = z.infer<typeof microfrontendRegistrationSchema>;
export type MicrofrontendHeartbeat = z.infer<typeof microfrontendHeartbeatSchema>;
export type MicrofrontendManifestEntry = z.infer<typeof microfrontendManifestEntrySchema>;
export type MicrofrontendListResponse = z.infer<typeof microfrontendListResponseSchema>;
export type ManifestResponse = z.infer<typeof manifestResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
