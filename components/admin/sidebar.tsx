import type { AdminProfile } from "@/domain/auth/admin-profile";
import { translations } from "@/infrastructure/i18n/translations";
import { ROUTES } from "@/lib/routes";
import { NavLink } from "./nav-link";

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

function UsersIcon() {
  return (
    <svg aria-hidden="true" className="size-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  );
}

function CategoriesIcon() {
  return (
    <svg aria-hidden="true" className="size-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-1.312-3.824" />
    </svg>
  );
}

function OperationsIcon() {
  return (
    <svg aria-hidden="true" className="size-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg aria-hidden="true" className="size-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
    </svg>
  );
}

export function Sidebar({ profile, className = "" }: SidebarProps) {
  const copy = translations.navigation;
  const linkClass = "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#536176] hover:bg-[#F4F1EE] hover:text-[#1A2B48] transition-colors";
  const activeLinkClass = "bg-[#1A2B48] text-[#F4F1EE] hover:bg-[#1A2B48] hover:text-[#F4F1EE]";

  return (
    <aside
      aria-label={copy.mainNav}
      className={`w-72 shrink-0 bg-white border-r border-[#1A2B48]/10 flex flex-col ${className}`.trim()}
    >
      <SidebarHeader profile={profile} />

      <nav aria-label={copy.mainNav} className="flex-1 p-4 space-y-1">
        <NavLink href={ROUTES.users} className={linkClass} activeClassName={activeLinkClass}>
          <UsersIcon />
          <span>{copy.users}</span>
        </NavLink>

        <NavLink href={ROUTES.categories} className={linkClass} activeClassName={activeLinkClass}>
          <CategoriesIcon />
          <span>{copy.categories}</span>
        </NavLink>

        <NavLink href={ROUTES.operations} className={linkClass} activeClassName={activeLinkClass}>
          <OperationsIcon />
          <span>{copy.operations}</span>
        </NavLink>
      </nav>


      <div className="p-4 border-t border-[#1A2B48]/10">
        <a
          href={ROUTES.logout}
          role="button"
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-[#536176] hover:bg-[#F4F1EE] hover:text-[#1A2B48] transition-colors"
        >
          <LogoutIcon />
          <span>{copy.signOut}</span>
        </a>
      </div>
    </aside>
  );
}
