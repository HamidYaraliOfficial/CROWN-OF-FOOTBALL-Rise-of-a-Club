# Architecture Overview

## Current layers

- `apps/web`: React + TypeScript interface, Three.js match presentation, local career state.
- `apps/api`: NestJS API scaffold with a development in-memory career adapter.
- `database/schema.sql`: proposed PostgreSQL schema, not currently wired into the API path.
- `PLAY_NOW.html`: standalone single-file experience without npm dependencies.

## Important boundary

The statistical match engine should be deterministic when supplied a seed and the same inputs. The Three.js scene renders the event sequence rather than determining the result. In an eventual multiplayer release, all consequential state and results must be validated by a trusted server.

## Extension path

1. Replace the API's in-memory adapter with repository interfaces and a PostgreSQL/Prisma implementation.
2. Add authentication and enforce per-career ownership on every API operation.
3. Add migrations and transactional transfer/finance operations.
4. Add replay versioning and simulation seed storage.
5. Add server-side authorization, rate limiting, audit history, and deployment hardening before online play.
