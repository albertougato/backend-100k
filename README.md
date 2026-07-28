# backend-100k

A small REST API built to practice production-grade backend practices: layered
architecture, authentication, structured logging, database migrations,
containerization, and a CI pipeline that gates every merge.

## Stack

- Node.js + TypeScript, Express 5
- PostgreSQL via `pg`, schema managed with `node-pg-migrate`
- JWT auth (`jsonwebtoken` + `bcryptjs`), request validation with `zod`
- Structured logging with `pino` (redacts secrets/passwords, tags every
  request with a `requestId`)
- `helmet` for security headers, `express-rate-limit` on the auth endpoints,
  explicit opt-in CORS via `CORS_ORIGIN`
- Jest + Supertest for tests, ESLint + Prettier for code quality
- Docker (multi-stage build, non-root runtime user) + Docker Compose
- GitHub Actions CI

## Architecture

Requests flow through a fixed set of layers:

```
routes -> controllers -> services -> repositories -> database
```

- **routes**: wire HTTP verbs/paths to controllers and apply middleware
  (`authenticate`, rate limiting).
- **controllers**: parse/validate input (`zod`), call a service, shape the
  HTTP response. No business logic.
- **services**: business rules (uniqueness checks, password hashing, token
  issuance). Framework-agnostic — no `req`/`res`.
- **repositories**: the only layer that talks to Postgres (raw parameterized
  SQL via `pg`).

Errors are thrown as `BusinessError` (with an HTTP status) or `ZodError` and
handled in one place: [`errorHandler`](src/middlewares/errorHandler.ts), which
also logs the failure and normalizes the JSON error response.

## Running locally

```bash
cp .env.example .env   # fill in a real JWT_SECRET
npm install
npm run migrate:up
npm run dev
```

Requires a local Postgres matching the `DB_*` values in `.env` (or start one
with `docker compose up postgres`).

## Running with Docker

```bash
docker compose up --build
```

This starts Postgres, runs migrations to completion, then starts the API —
`api` only comes up after `migrate` exits successfully
(`depends_on: condition: service_completed_successfully`).

## Testing & code quality

```bash
npm test           # jest + supertest, database calls are mocked
npm run lint        # eslint
npm run format:check # prettier --check
npm run build        # tsc
```

## CI/CD

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on every push and
pull request, against a real Postgres service container:

1. `npm ci`
2. `npm run migrate:up` — migrations must apply cleanly
3. `npm run lint`
4. `npm run format:check`
5. `npm test`
6. `npm run build`

Any failing step fails the workflow, so broken code can't merge silently.
This is CI: every change is automatically installed, migrated, linted,
tested, and built before it's trusted.

CD (automated deployment on merge to `main`) is the next step — the
`Dockerfile` already produces a production-ready image, so the pipeline can
be extended to build, push to a registry, and deploy it without a manual
step.
