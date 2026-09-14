# loresuelvo-admin-webapp

Admin panel built with Next.js.

## Setup

```bash
cp .env.example .env.local
```

## Run with Docker (dev, hot reload)

```bash
docker compose -f compose.dev.yml up --build
```

App at `http://localhost:3000`.

## Production build

```bash
docker compose -f compose.prod.yml --env-file .env.production up -d --build
```

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
