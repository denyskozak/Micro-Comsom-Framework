import type { ManifestResponse } from '@cosmos/discovery-contracts';

declare namespace App {
  interface ConnectedMicrofrontend {
    name: string;
    basePath: string;
    slot: string;
    ssrUrl: string;
  }

  interface Locals {
    manifest: ManifestResponse;
    connectedMicrofrontends: ConnectedMicrofrontend[];
  }
}
