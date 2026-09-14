import { cookies } from "next/headers";
import { AuthService, AuthSession, AppUser } from "./types";

export const MOCK_SESSION_COOKIE = "__e2e_session";

export class MockAuthAdapter implements AuthService {
  async getSession(): Promise<AuthSession | null> {
    try {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get(MOCK_SESSION_COOKIE);
      if (!sessionCookie?.value) return null;
      return JSON.parse(decodeURIComponent(sessionCookie.value)) as AuthSession;
    } catch {
      return null;
    }
  }

  async updateSession(userUpdate: Partial<AppUser>): Promise<void> {
    try {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get(MOCK_SESSION_COOKIE);
      if (!sessionCookie?.value) return;

      const currentSession = JSON.parse(decodeURIComponent(sessionCookie.value)) as AuthSession;
      currentSession.user = { ...currentSession.user, ...userUpdate };

      cookieStore.set(MOCK_SESSION_COOKIE, encodeURIComponent(JSON.stringify(currentSession)), {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
      });
    } catch {
      // Ignorar errores en mock
    }
  }
}
