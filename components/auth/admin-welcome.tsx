import type { AdminProfile } from "@/domain/auth/admin-profile";
import { translations } from "@/infrastructure/i18n/translations";

export interface AdminWelcomeProps {
  profile?: AdminProfile;
}

export function AdminWelcome({ profile: _profile }: AdminWelcomeProps = {}) {
  const copy = translations.auth;
  return (
    <section aria-label={copy.administration} className="relative overflow-hidden rounded-3xl bg-[#1A2B48] px-6 py-10 text-[#F4F1EE] sm:p-12">
      <div aria-hidden="true" className="mb-8 h-1 w-12 rounded-full bg-[#E8C479]" />
      <p className="mt-5 max-w-md leading-relaxed text-[#C9D3DF]">{copy.welcomeDescription}</p>
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -right-28 size-64 rounded-full border border-white/10" />
    </section>
  );
}
