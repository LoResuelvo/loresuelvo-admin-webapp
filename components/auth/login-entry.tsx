"use client";

import { ROUTES } from "@/lib/routes";
import { LoginScreen } from "./login-screen";

export function LoginEntry({ notice }: { notice?: string }) {
  return <LoginScreen notice={notice} onSignIn={() => window.location.assign(ROUTES.signIn)} />;
}
