import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { ROUTES } from "@/lib/routes";
import { Auth0Client } from "@auth0/nextjs-auth0/server";

let client: Auth0Client | undefined;

function getAuth0Connection(): string {
  const connection = process.env.AUTH0_CONNECTION;
  if (!connection) throw new Error("Authentication is not configured");
  return connection;
}

export function enforceAdminConnection(request: NextRequest): NextRequest {
  if (request.nextUrl.pathname !== ROUTES.signIn) return request;
  const url = request.nextUrl.clone();
  url.searchParams.set("connection", getAuth0Connection());
  return new NextRequest(url, request);
}

export function getAuth0(): Auth0Client {
  if (client) return client;
  const { APP_URL, AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_SECRET, AUTH0_AUDIENCE } = process.env;
  if (!APP_URL || !AUTH0_DOMAIN || !AUTH0_CLIENT_ID || !AUTH0_CLIENT_SECRET || !AUTH0_SECRET || !AUTH0_AUDIENCE) {
    throw new Error("Authentication is not configured");
  }
  client = new Auth0Client({
    appBaseUrl: APP_URL,
    domain: AUTH0_DOMAIN,
    clientId: AUTH0_CLIENT_ID,
    clientSecret: AUTH0_CLIENT_SECRET,
    secret: AUTH0_SECRET,
    authorizationParameters: {
      audience: AUTH0_AUDIENCE,
      connection: getAuth0Connection(),
      scope: "openid profile email offline_access",
    },
    signInReturnToPath: ROUTES.admin,
    onCallback: async (error) => {
      const destination = new URL(error ? ROUTES.home : ROUTES.admin, APP_URL);
      if (error) destination.searchParams.set("auth", "incomplete");
      const response = NextResponse.redirect(destination);
      response.headers.set("Cache-Control", "no-store");
      return response;
    },
    enableAccessTokenEndpoint: false,
    session: { cookie: { name: "__admin_session", sameSite: "lax" } },
    transactionCookie: { prefix: "__admin_transaction_", sameSite: "lax" },
  });
  return client;
}
