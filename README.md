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
