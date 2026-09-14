import "server-only";
import { AccessError } from "@/domain/auth/access-error";
import type { AuthSession } from "@/ports/auth/auth-session";
import { getAuth0 } from "./auth0";

export const authSession: AuthSession = {
  async getAccessToken() {
    const auth = getAuth0();
    const session = await auth.getSession();
    if (!session) throw new AccessError("unauthenticated");
    const { token } = await auth.getAccessToken();
    if (!token) throw new AccessError("unauthenticated");
    return token;
  },
};
