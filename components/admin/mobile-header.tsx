"use client";

import { useState } from "react";
import type { AdminProfile } from "@/domain/auth/admin-profile";
import { translations } from "@/infrastructure/i18n/translations";
import { ROUTES } from "@/lib/routes";
import { NavLink } from "./nav-link";

export interface MobileHeaderProps {
  profile: AdminProfile;
  className?: string;
}

function MenuIcon() {
  return (
    <svg aria-hidden="true" className="size-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="size-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
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

function LogoutIcon() {
  return (
    <svg aria-hidden="true" className="size-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
    </svg>
  );
}

interface MobileHeaderBarProps {
  isOpen: boolean;
  onToggle: () => void;
}

function MobileHeaderBar({ isOpen, onToggle }: MobileHeaderBarProps) {
  const copy = translations.navigation;
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <span className="text-lg font-semibold tracking-tight text-[#1A2B48]">
          {copy.brand}
        </span>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#147560]">
          {copy.area}
        </p>
      </div>

      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="mobile-nav-menu"
        aria-label={copy.openMenu}
        onClick={onToggle}
        className="p-2 rounded-lg text-[#1A2B48] hover:bg-[#F4F1EE] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147560]"
      >
        <MenuIcon />
      </button>
    </div>
  );
}

function DrawerHeader({ onClose }: { onClose: () => void }) {
  const copy = translations.navigation;
  return (
    <div className="flex items-center justify-between p-4 border-b border-[#1A2B48]/10">
      <div>
        <span className="text-lg font-semibold tracking-tight text-[#1A2B48]">
          {copy.brand}
        </span>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#147560]">
          {copy.area}
        </p>
      </div>

      <button
        type="button"
        aria-label={copy.closeMenu}
        onClick={onClose}
        className="p-2 rounded-lg text-[#536176] hover:bg-[#F4F1EE] hover:text-[#1A2B48] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147560]"
      >
        <CloseIcon />
      </button>
    </div>
  );
}

function DrawerNav({ onClose }: { onClose: () => void }) {
  const copy = translations.navigation;
  const linkClass = "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#536176] hover:bg-[#F4F1EE] hover:text-[#1A2B48] transition-colors";
  const activeLinkClass = "bg-[#1A2B48] text-[#F4F1EE] hover:bg-[#1A2B48] hover:text-[#F4F1EE]";

  return (
    <nav aria-label={copy.mainNav} className="p-4 space-y-1">
      <NavLink href={ROUTES.users} className={linkClass} activeClassName={activeLinkClass} onClick={onClose}>
        <UsersIcon />
        <span>{copy.users}</span>
      </NavLink>

      <NavLink href={ROUTES.categories} className={linkClass} activeClassName={activeLinkClass} onClick={onClose}>
        <CategoriesIcon />
        <span>{copy.categories}</span>
      </NavLink>
    </nav>
  );
}

function DrawerFooter() {
  const copy = translations.navigation;
  return (
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
  );
}

interface MobileDrawerProps {
  profile: AdminProfile;
  onClose: () => void;
}

function MobileDrawer({ profile, onClose }: MobileDrawerProps) {
  const copy = translations.navigation;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={copy.mainNav}
      className="relative z-10 w-4/5 max-w-xs bg-white shadow-xl flex flex-col justify-between"
    >
      <div>
        <DrawerHeader onClose={onClose} />

        <div className="p-4 border-b border-[#1A2B48]/10 min-w-0">
          <p className="break-words font-semibold text-sm text-[#1A2B48]">
            {profile.firstName} {profile.lastName}
          </p>
          <p className="mt-0.5 break-all text-xs text-[#536176]">
            {profile.email}
          </p>
        </div>

        <DrawerNav onClose={onClose} />
      </div>

      <DrawerFooter />
    </div>
  );
}

export function MobileHeader({ profile, className = "" }: MobileHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`bg-white border-b border-[#1A2B48]/10 ${className}`.trim()}>
      <MobileHeaderBar isOpen={isOpen} onToggle={() => setIsOpen((prev) => !prev)} />

      {isOpen && (
        <div id="mobile-nav-menu" className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 transition-opacity"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <MobileDrawer profile={profile} onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
}
