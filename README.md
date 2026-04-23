# Micro Cosmos Framework (Prototype)

Micro Cosmos Framework is a production-oriented **enterprise SSR micro-frontend platform prototype** in an Nx monorepo.  
It demonstrates how an Astro shell composes pages from independently running SSR micro-frontends that self-register into a discovery service.

## Architecture overview

### Monorepo layout

```txt
apps/
  shell-astro/            Astro SSR shell + composition middleware
  service-discovery/      Node.js discovery service (native http + Zod)
  mf-react-catalog/       Example React + React Router SSR micro-frontend
libs/
  discovery-contracts/    Shared Zod schemas and inferred TypeScript types
  discovery-client/       Reusable service-discovery registration/heartbeat client
  shared-types/           Optional shared platform types
```

### Runtime components

- **Astro shell (`shell-astro`)**
  - Main UI shell and SSR composer.
  - Reads manifest from discovery at request time in Astro middleware.
  - Selects a micro-frontend based on `basePath` and route patterns.
  - Calls micro-frontend SSR endpoint and injects returned HTML.

- **Service discovery (`service-discovery`)**
  - Native Node.js `http` server.
  - In-memory registry with TTL expiration.
  - Zod validation + normalized JSON errors.
  - Exposes:
    - `POST /register`
    - `POST /heartbeat`
    - `GET /microfrontends`
    - `GET /manifest`
    - `GET /health`

- **React catalog micro-frontend (`mf-react-catalog`)**
  - React + React Router SSR.
  - Serves `GET /ssr?route=/catalog/...` endpoint returning rendered HTML.
  - Registers itself on startup through `@cosmos/discovery-client`.
  - Sends periodic heartbeats.

## Why this architecture

- **Why Astro as shell/UI composer**
  - Astro is lightweight for SSR shells and excellent at server-side route orchestration.
  - It keeps composition logic straightforward while allowing multiple frontend stacks behind SSR endpoints.

- **Why service discovery is separate**
  - Decouples shell composition from static config and deployment topology.
  - Lets micro-frontends join/leave dynamically via registration + heartbeat lease model.

- **Why discovery-client is a shared library**
  - Avoids duplicated registration logic across micro-frontends.
  - Keeps contracts and request behavior consistent and strongly typed.

## Local ports

- Shell (Astro): `4300`
- Discovery service: `4400`
- Catalog micro-frontend: `4500`

## Request flow (SSR composition)

1. Browser requests a route from `shell-astro`.
2. Astro middleware fetches `GET /manifest` from `service-discovery`.
3. Shell page logic finds matching micro-frontend for the request path.
4. Shell fetches SSR HTML from micro-frontend `ssrUrl`.
5. Shell injects fragment HTML into shell page response.

## Registration flow

1. Micro-frontend starts.
2. It calls `POST /register` via `@cosmos/discovery-client`.
3. Discovery stores registration with TTL lease.
4. Micro-frontend sends periodic `POST /heartbeat`.
5. Discovery drops expired entries during cleanup and on reads.

## Getting started

> Prerequisite: Node.js 20+ and pnpm.

```bash
pnpm install
```

Run services in separate terminals:

```bash
pnpm serve:discovery
pnpm serve:catalog
pnpm serve:shell
```

Or try running all together:

```bash
pnpm serve:all
```

## Example URLs

- Shell home: http://localhost:4300/
- Composed catalog list: http://localhost:4300/catalog
- Composed catalog detail: http://localhost:4300/catalog/1
- Discovery health: http://localhost:4400/health
- Discovery manifest: http://localhost:4400/manifest

## Nx targets

- `nx serve service-discovery`
- `nx serve mf-react-catalog`
- `nx serve shell-astro`
- `nx run-many -t serve -p service-discovery,mf-react-catalog,shell-astro --parallel=3`
- `nx run-many -t build -p discovery-contracts,discovery-client,service-discovery,mf-react-catalog,shell-astro`
- `nx run-many -t typecheck -p discovery-contracts,discovery-client,service-discovery,mf-react-catalog,shell-astro`

## Evolution path toward fuller enterprise platform

This prototype intentionally stays minimal and explicit while preserving good platform boundaries:

- Discovery can move from in-memory to persistent registry without changing client contracts.
- Shell can evolve from one SSR fragment call to multi-fragment orchestration and caching.
- Additional micro-frontends can adopt the same discovery-client and contracts with no shell code changes.
- Observability, authN/authZ, tenancy, and rollout strategies can be layered in incrementally.

The result is a coherent starting point for enterprise SSR micro-frontend platform evolution rather than a toy tutorial.
