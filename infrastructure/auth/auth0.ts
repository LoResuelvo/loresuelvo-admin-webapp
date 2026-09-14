import "server-only";
import { ROUTES } from "@/lib/routes";
import { Auth0Client } from "@auth0/nextjs-auth0/server";

let client: Auth0Client | undefined;

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
    authorizationParameters: { audience: AUTH0_AUDIENCE, scope: "openid profile email" },
    signInReturnToPath: ROUTES.admin,
    enableAccessTokenEndpoint: false,
    session: { cookie: { name: "__admin_session", sameSite: "lax" } },
    transactionCookie: { prefix: "__admin_transaction_", sameSite: "lax" },
  });
  return client;
}
