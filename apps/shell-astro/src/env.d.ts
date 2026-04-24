/// <reference types="astro/client" />
import type { ManifestResponseSchema} from "@cosmos/discovery-contracts";

declare namespace App {
    interface Locals {
        manifest: ManifestResponseSchema;
    }
}