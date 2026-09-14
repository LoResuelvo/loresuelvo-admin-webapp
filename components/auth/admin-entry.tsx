"use client";

import { translations } from "@/infrastructure/i18n/translations";
import { AdminWelcome } from "./admin-welcome";
import { AccessLoading } from "./access-loading";
import { useAdminAccess } from "./use-admin-access";

export function AdminEntry() {
  const access = useAdminAccess();
  if (access.status === "pending") return <AccessLoading />;
  if (access.status === "ready") return <AdminWelcome profile={access.profile} />;
  return (
    <main className="grid min-h-svh place-items-center bg-[#F4F1EE] px-6 text-[#1A2B48]">
      <p role="alert">{translations.auth.accessUnavailable}</p>
    </main>
  );
}
