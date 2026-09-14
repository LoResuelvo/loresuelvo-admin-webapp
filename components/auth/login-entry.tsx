"use client";

import { ROUTES } from "@/lib/routes";
import { LoginScreen } from "./login-screen";

export function LoginEntry() {
  return <LoginScreen onSignIn={() => window.location.assign(ROUTES.signIn)} />;
}
