import "server-only";
import { AccessTokenError, AccessTokenErrorCode } from "@auth0/nextjs-auth0/errors";
import { AccessError } from "@/domain/auth/access-error";
import type { AuthSession } from "@/ports/auth/auth-session";
import { getAuth0 } from "./auth0";

function requiresNewAuthentication(error: unknown): boolean {
  if (!(error instanceof AccessTokenError)) return false;
  switch (error.code) {
    case AccessTokenErrorCode.MISSING_SESSION:
    case AccessTokenErrorCode.MISSING_REFRESH_TOKEN:
    case AccessTokenErrorCode.SESSION_EXPIRED:
      return true;
    case AccessTokenErrorCode.FAILED_TO_REFRESH_TOKEN:
      return error.cause?.code === "invalid_grant";
    default:
      return false;
  }
}

export const authSession: AuthSession = {
  async getAccessToken() {
    const auth = getAuth0();
    const session = await auth.getSession();
    if (!session) throw new AccessError("unauthenticated");
    try {
      const { token } = await auth.getAccessToken();
      if (!token) throw new AccessError("sessionExpired");
      return token;
    } catch (error: unknown) {
      if (requiresNewAuthentication(error)) throw new AccessError("sessionExpired");
      throw error;
    }
  },
};
