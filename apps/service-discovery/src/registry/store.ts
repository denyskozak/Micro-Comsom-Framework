import type { MicrofrontendManifestEntry, MicrofrontendRegistration } from '@cosmos/discovery-contracts';

type RegistryRecord = {
  registration: MicrofrontendRegistration;
  registeredAtMs: number;
  expiresAtMs: number;
};

const getKey = (name: string, instanceId: string) => `${name}::${instanceId}`;

export class MicrofrontendRegistry {
  private readonly records = new Map<string, RegistryRecord>();

  upsert(registration: MicrofrontendRegistration): MicrofrontendManifestEntry {
    const now = Date.now();
    const expiresAtMs = now + registration.ttlSec * 1000;
    const key = getKey(registration.name, registration.instanceId);
    const existing = this.records.get(key);

    this.records.set(key, {
      registration,
      registeredAtMs: existing?.registeredAtMs ?? now,
      expiresAtMs
    });

    return this.toEntry(this.records.get(key)!);
  }

  heartbeat(name: string, instanceId: string): MicrofrontendManifestEntry | null {
    const key = getKey(name, instanceId);
    const existing = this.records.get(key);
    if (!existing) return null;

    existing.expiresAtMs = Date.now() + existing.registration.ttlSec * 1000;
    this.records.set(key, existing);
    return this.toEntry(existing);
  }

  listActive(): MicrofrontendManifestEntry[] {
    const now = Date.now();
    const entries: MicrofrontendManifestEntry[] = [];

    for (const [key, record] of this.records) {
      if (record.expiresAtMs <= now) {
        this.records.delete(key);
        continue;
      }
      entries.push(this.toEntry(record));
    }

    return entries.sort((a, b) => a.name.localeCompare(b.name));
  }

  pruneExpired(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, record] of this.records) {
      if (record.expiresAtMs <= now) {
        this.records.delete(key);
        removed += 1;
      }
    }

    return removed;
  }

  private toEntry(record: RegistryRecord): MicrofrontendManifestEntry {
    return {
      ...record.registration,
      registeredAt: new Date(record.registeredAtMs).toISOString(),
      expiresAt: new Date(record.expiresAtMs).toISOString()
    };
  }
}
