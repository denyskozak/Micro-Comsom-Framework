import type { ManifestResponse } from '@cosmos/discovery-contracts';

declare namespace App {
  interface Locals {
    manifest: ManifestResponse;
  }
}
