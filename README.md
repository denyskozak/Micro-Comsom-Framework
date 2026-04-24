# Micro-Cosmos Framework

Micro Cosmos meta-framework is a open source production-oriented **enterprise SSR micro-frontend platform prototype** designed to serve different independent frontend teams in one project
## Problems

- No scalable vertical and horizontal solution for SSR microfrontends
- Difficulty to use few frontend fromeworks in single project
- Inconcistancy between teams in organization

## Solutions

- Free Micro-frontends with out-of-the box
- Framework Agnostic - use React, Vue, Angular, etc
- Built modulary and on universal Hotwire approach


## Architecture overview

### Astro

Astro is a flexible, unopinionated framework that allows you to configure your project in many different ways. In our case is UI composer which "fetch -> collect -> render" micro-frontends with cache

### Hotwire (HTML-Over-The-Wire Approach)

Hotwire is an alternative approach to building modern web applications without using much JavaScript by sending HTML instead of JSON over the wire. This makes for fast first-load pages, keeps template rendering on the server, and allows for a simpler, more productive development experience in any programming language, without sacrificing any of the speed or responsiveness associated with a traditional single-page application.


### Monorepo layout

```txt
apps/
  shell-astro/            Astro SSR shell + composition middleware
  service-discovery/      Node.js discovery service (native http + Zod)
  mf-react-catalog/       Example React + React Router SSR content micro-frontend
  mf-header-ssr/          SSR header micro-frontend with Sign-In event emitter
  mf-footer-ssr/          SSR footer micro-frontend
  mf-auth-client/         Client-side auth micro-frontend listening for header events
libs/
  discovery-contracts/    Shared Zod schemas and inferred TypeScript types
  discovery-client/       Reusable service-discovery registration/heartbeat client
  shared-types/           Optional shared platform types
  mfe-infrastructure/     Nx package with orchestration targets for MFE runtime
  vitest-config/          Shared Vitest config factory helpers
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
- Header micro-frontend: `4501`
- Footer micro-frontend: `4502`
- Auth micro-frontend: `4503`

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
pnpm serve:header
pnpm serve:footer
pnpm serve:auth
pnpm serve:shell
```

Or try running all together:

```bash
pnpm serve:all
```

Or run only MFE servers (without shell/discovery):

```bash
pnpm serve:mfe-infrastructure
```

## Example URLs

- Shell home: http://localhost:4300/
- Composed catalog list: http://localhost:4300/catalog
- Header Sign-In button emits `auth:signin-click` via EventEmitter3
- Auth micro-frontend updates status text after Sign-In click
- Composed catalog detail: http://localhost:4300/catalog/1
- Discovery health: http://localhost:4400/health
- Discovery manifest: http://localhost:4400/manifest

## Nx targets

- `nx serve service-discovery`
- `nx serve mf-react-catalog`
- `nx serve mf-header-ssr`
- `nx serve mf-footer-ssr`
- `nx serve mf-auth-client`
- `nx serve shell-astro`
- `nx run-many -t serve -p service-discovery,mf-react-catalog,shell-astro --parallel=3`
- `nx serve mfe-infrastructure`
- `nx run mfe-infrastructure:serve:platform`
- `nx run-many -t build -p discovery-contracts,discovery-client,service-discovery,mf-react-catalog,shell-astro`
- `nx run-many -t typecheck -p discovery-contracts,discovery-client,service-discovery,mf-react-catalog,shell-astro`

## Evolution path toward fuller enterprise platform

This prototype intentionally stays minimal and explicit while preserving good platform boundaries:

- Discovery can move from in-memory to persistent registry without changing client contracts.
- Shell can evolve from one SSR fragment call to multi-fragment orchestration and caching.
- Additional micro-frontends can adopt the same discovery-client and contracts with no shell code changes.
- Observability, authN/authZ, tenancy, and rollout strategies can be layered in incrementally.

The result is a coherent starting point for enterprise SSR micro-frontend platform evolution rather than a toy tutorial.
