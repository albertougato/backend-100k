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
7. `docker build` — the production image must build from a clean checkout
8. on `push` to `main` only: push the image to
   [GHCR](https://ghcr.io) as `ghcr.io/<owner>/backend-100k:<sha>` and `:latest`
9. on `push` to `main` only: open an SSH tunnel to the production database
   and run `npm run migrate:up` against it, using the local migration files
   (the published image intentionally doesn't ship `migrations/`, so the
   schema is migrated from CI, not from inside the container)
10. on `push` to `main` only: SSH into the server, `docker compose pull`
    the new image, restart the `api` container, then poll it for up to a
    minute and **fail the deploy** if it never reports `healthy` — the image
    has a `HEALTHCHECK` (`wget` against `/health`), so a container that
    starts but crash-loops, or never becomes ready, fails the pipeline
    instead of silently leaving a broken version running in production

Any failing step fails the workflow, so broken code can't merge silently.
This is CI: every change is automatically installed, migrated, linted,
tested, built, and containerized before it's trusted. Steps 1-7 run for
every push and pull request (including feature branches); steps 8-10 are
gated to `main` only, since publishing an image or touching the production
server for every branch would be both wasteful and dangerous, and pull
requests from forks don't have access to the deploy secrets anyway.

This is now full CD: a `git push` to `main` ends with the new code running
on the server, with no manual step in between. The production database is
never exposed to the internet — CI reaches it the same way a human would,
through an SSH tunnel authenticated with a dedicated deploy key that has no
other privileges than reaching this one server.

## Secrets management

No secret ever lives in the repo — `.env` is gitignored, `.env.example`
documents the shape without real values, and git history has been checked
for leaks (none found). Everything real lives in one of two places:

| Secret | Where it lives | Used for | Rotate when |
|---|---|---|---|
| `JWT_SECRET` (prod) | server-side `.env` only | signing auth tokens | on suspected compromise only — rotating invalidates every issued token and logs everyone out, so it's not done on a schedule |
| `DB_PASSWORD` (prod) | server-side `.env` + GitHub secret `PROD_DB_PASSWORD` | Postgres auth | periodically; requires updating both places together, then redeploying |
| `DEPLOY_SSH_KEY` | GitHub secret only (public half in the server's `authorized_keys`) | CI → server access, dedicated to this one purpose | if the repo's secrets are ever suspected exposed |
| GHCR pull access | **not stored anywhere persistent** — each deploy logs in with the run's own `GITHUB_TOKEN` and logs out immediately after | pulling the image on the server | nothing to rotate, it expires on its own every run |

The last row is deliberate: earlier this project used a long-lived GitHub
Personal Access Token stored in the server's Docker config to pull images,
which meant a credential sitting on disk that would silently break the
pipeline when it expired. It was replaced with a per-deploy, self-expiring
token and the standing credential was revoked (`docker logout`) — one less
long-lived secret to lose track of.

## Rollback

Every image pushed to GHCR is tagged with the exact git SHA it was built
from (visible live at `GET /health`), so any previously deployed version can
be redeployed on demand via
[`.github/workflows/rollback.yml`](.github/workflows/rollback.yml):

```
gh workflow run rollback.yml -f version=<git-sha>
```

(or from GitHub → Actions → "Rollback" → "Run workflow"). It reuses the same
ephemeral-login and health-check-verified deploy logic as the normal
pipeline — it just skips the build/test/push steps and redeploys an image
that's already published.

**This rolls back the code, not the database schema.** If the version being
rolled back to predates a migration that's already been applied, check
whether the migration is backward-compatible before rolling back; if not,
run `npm run migrate:down` through the same SSH tunnel used for forward
migrations (see the "Run database migrations on server" step in `ci.yml`
for the tunnel command) before redeploying the older code.
