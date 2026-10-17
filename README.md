# loresuelvo-admin-webapp

Admin panel built with Next.js.

## Setup

```bash
cp .env.example .env.local
```

For a local API exposed on host port 8080, run Next on the host with
`npm install` and `npm run dev`; the example `API_URL=http://localhost:8080`
then reaches that API. `API_URL` is used by the Next server, not by the browser.

## Run with Docker (dev, hot reload)

```bash
docker compose -f compose.dev.yml up --build
```

App at `http://localhost:3000`.

Before starting Docker, set `API_URL` in `.env.local` to an API address reachable
from the admin container. Inside that container, `localhost:8080` refers to the
admin container itself. The API lives in a separate Compose project, so its
service name is reachable only if both projects share a network. Use a reachable
host address or configure a shared network for local development; keep the host
example when running Next directly on the host.

## Release and deployment

Push a `vX.Y.Z` tag to run tests, publish `ghcr.io/loresuelvo/gestion` and
pass its immutable digest and release tag to
[`infra-devops/deploy-admin-webapp.yml`](https://github.com/LoResuelvo/infra-devops/blob/main/.github/workflows/deploy-admin-webapp.yml).
Infra deploys staging first, then production through its GitHub Environment.
Set `APP_ENV=production` for every deployment used by real operators, including
staging: the admin disables its E2E cookie fixtures only with that value.

Production Compose, public environment configuration, Ansible playbooks and
replica deployment are maintained in `infra-devops`. Admin runtime secrets come
from `/webapp-admin` in Infisical for each environment. See the
[infrastructure deployment guide](https://github.com/LoResuelvo/infra-devops/blob/main/docs/user-guide.md#despliegue-de-admin-web-app)
for setup and prerequisites.

## Administrator login

See the [configuration and external verification guide](docs/admin-login.md).
Real Auth0/MFA verification remains pending until the environment is configured.

## Authentication test coverage

Login navigation E2E tests replace the same-origin `/auth/login` boundary with a
redirect to a simulated Auth0 portal. They verify the browser destination and
pending button behavior without tenant credentials or a local identity provider.
The boundary document uses `location.replace` so Playwright can intercept the new
navigation; it does not reproduce an HTTP redirect chain or exercise the real SDK
authorization handshake.

Separate unit tests verify middleware delegation to the SDK, safe error responses,
and server-only token configuration with independent administrator cookies.
Real Auth0 login, callback, and MFA require manual end-to-end validation using the
separate Admin Regular Web Application configured through `.env.example`.
Never reuse client-webapp secrets.

The Admin request includes `offline_access`; enable **Allow Offline Access** for
the Auth0 API and the Refresh Token grant for the Admin application. The server
SDK owns token renewal and cookie updates; no refresh token is exposed to browser
code. Missing or revoked refresh credentials require sign-in again, while
configuration and temporary provider failures remain service errors.
See [Auth0 refresh-token prerequisites](https://auth0.com/docs/secure/tokens/refresh-tokens/get-refresh-tokens).

## Dependency security

Next.js stays on the patched 15.x release line. Its scoped `postcss` override
reuses the direct PostCSS dependency because Next 15.5.25 still pins vulnerable
8.4.31. Keep this override until Next ships a patched PostCSS version; review it
when upgrading Next. `package-lock.json` records the audited dependency graph.
