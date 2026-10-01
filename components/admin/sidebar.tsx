import type { AdminProfile } from "@/domain/auth/admin-profile";
import { translations } from "@/infrastructure/i18n/translations";
import { ROUTES } from "@/lib/routes";
import { AdminNavigation } from "./admin-navigation";

export interface SidebarProps {
  profile: AdminProfile;
  className?: string;
}

function SidebarHeader({ profile }: { profile: AdminProfile }) {
  const copy = translations.navigation;
  return (
    <header role="banner" className="p-6 border-b border-[#1A2B48]/10">
      <div>
        <span className="text-xl font-semibold tracking-tight text-[#1A2B48]">
          {copy.brand}
        </span>
        <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#147560]">
          {copy.area}
        </p>
      </div>
      <div className="mt-4 pt-4 border-t border-[#1A2B48]/10 min-w-0">
        <p className="break-words font-semibold text-sm text-[#1A2B48]">
          {profile.firstName} {profile.lastName}
        </p>
        <p className="mt-0.5 break-all text-xs text-[#536176]">
          {profile.email}
        </p>
      </div>
    </header>
  );
}

function LogoutIcon() {
  return (
    <svg aria-hidden="true" className="size-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
    </svg>
  );
}

function SidebarFooter() {
  const copy = translations.navigation;
  return (
    <div className="p-4 border-t border-[#1A2B48]/10">
      <a
        href={ROUTES.logout}
        role="button"
        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-[#536176] hover:bg-[#F4F1EE] hover:text-[#1A2B48] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147560] transition-colors"
      >
        <LogoutIcon />
        <span>{copy.signOut}</span>
      </a>
    </div>
  );
}

export function Sidebar({ profile, className = "" }: SidebarProps) {
  const copy = translations.navigation;

  return (
    <aside
      aria-label={copy.mainNav}
      className={`w-72 shrink-0 bg-white border-r border-[#1A2B48]/10 flex flex-col ${className}`.trim()}
    >
      <SidebarHeader profile={profile} />
      <AdminNavigation />
      <SidebarFooter />
    </aside>
  );
}
