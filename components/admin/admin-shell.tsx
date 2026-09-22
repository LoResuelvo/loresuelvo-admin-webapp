"use client";

import type { ReactNode } from "react";
import { useAdminAccess } from "@/components/auth/use-admin-access";
import { AccessLoading } from "@/components/auth/access-loading";
import { LoginEntry } from "@/components/auth/login-entry";
import { AccessIssue } from "@/components/auth/access-issue";
import { translations } from "@/infrastructure/i18n/translations";
import { Sidebar } from "./sidebar";
import { MobileHeader } from "./mobile-header";

export function AdminShell({ children }: { children: ReactNode }) {
  const access = useAdminAccess();

  if (access.status === "unauthenticated") return <LoginEntry />;
  if (access.status === "sessionExpired") return <LoginEntry notice={translations.auth.sessionExpired} />;
  if (access.status === "notProvisioned") return <AccessIssue message={translations.auth.notProvisioned} />;
  if (access.status === "forbidden") return <AccessIssue message={translations.auth.forbidden} />;
  if (access.status === "pending") return <AccessLoading />;
  if (access.status === "ready") {
    return (
      <div className="flex min-h-svh flex-col md:flex-row bg-[#F4F1EE] text-[#1A2B48]">
        <MobileHeader profile={access.profile} className="md:hidden" />
        <Sidebar profile={access.profile} className="hidden md:flex" />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-6 sm:p-10">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return <AccessIssue message={translations.auth.accessUnavailable} onRetry={access.retry} />;
}
