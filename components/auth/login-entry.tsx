"use client";

import { ROUTES } from "@/lib/routes";
import { LoginScreen } from "./login-screen";

export function LoginEntry({ notice, returnTo }: { notice?: string; returnTo?: string }) {
  const signInUrl = returnTo
    ? `${ROUTES.signIn}?returnTo=${encodeURIComponent(returnTo)}`
    : ROUTES.signIn;

  return <LoginScreen notice={notice} onSignIn={() => window.location.assign(signInUrl)} />;
}
