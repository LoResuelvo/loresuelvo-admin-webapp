"use client";

import { translations } from "@/infrastructure/i18n/translations";
import { AccessLoading } from "./access-loading";
import { useAdminAccess } from "./use-admin-access";

export function AdminEntry() {
  const access = useAdminAccess();
  if (access.status === "pending") return <AccessLoading />;
  return (
    <main className="grid min-h-svh place-items-center bg-[#F4F1EE] px-6 text-[#1A2B48]">
      {access.status === "ready" ? (
        <section aria-label={translations.auth.administration}>
          <h1 className="text-3xl font-semibold">{translations.auth.welcome}</h1>
        </section>
      ) : <p role="alert">{translations.auth.accessUnavailable}</p>}
    </main>
  );
}
