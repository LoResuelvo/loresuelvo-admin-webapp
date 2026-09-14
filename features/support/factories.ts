import { AuthSession } from "../../infrastructure/auth/types";

export function aSession(
  role: string = "admin",
  userOverrides: Partial<AuthSession["user"]> = {}
): AuthSession {
  return {
    user: {
      id: "admin-1",
      email: "admin@loresuelvo.com",
      firstName: "Admin",
      lastName: "User",
      role,
      ...userOverrides,
    },
    accessToken: "mock-jwt-token",
  };
}
