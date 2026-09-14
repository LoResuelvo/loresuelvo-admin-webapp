import type { AdminProfile } from "@/domain/auth/admin-profile";
import { translations } from "@/infrastructure/i18n/translations";

export function AdminWelcome({ profile }: { profile: AdminProfile }) {
  const copy = translations.auth;
  return (
    <div className="min-h-svh bg-[#F4F1EE] text-[#1A2B48]">
      <header className="border-b border-[#1A2B48]/10 bg-white px-6 py-6 sm:px-10">
        <div className="mx-auto flex max-w-6xl min-w-0 flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xl font-semibold tracking-tight">{copy.brand}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#147560]">{copy.area}</p>
          </div>
          <div className="min-w-0 sm:text-right">
            <p className="break-words font-semibold">{profile.firstName} {profile.lastName}</p>
            <p className="mt-1 break-all text-sm text-[#536176]">{profile.email}</p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-12 sm:px-10 sm:py-20">
        <section aria-label={copy.administration} className="relative overflow-hidden rounded-3xl bg-[#1A2B48] px-6 py-10 text-[#F4F1EE] sm:p-12">
          <div aria-hidden="true" className="mb-8 h-1 w-12 rounded-full bg-[#E8C479]" />
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#E8C479]">{copy.accessVerified}</p>
          <h1 className="max-w-xl text-3xl font-semibold tracking-tight sm:text-5xl">{copy.welcome}</h1>
          <p className="mt-5 max-w-md leading-relaxed text-[#C9D3DF]">{copy.welcomeDescription}</p>
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -right-28 size-64 rounded-full border border-white/10" />
        </section>
      </main>
    </div>
  );
}
