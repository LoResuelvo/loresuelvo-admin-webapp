"use client";

import { useState } from "react";
import type { AdminProfile } from "@/domain/auth/admin-profile";
import { translations } from "@/infrastructure/i18n/translations";
import { ROUTES } from "@/lib/routes";
import * as Dialog from "@radix-ui/react-dialog";
import { AdminNavigation } from "./admin-navigation";
import { DialogSurface } from "@/components/ui/dialog-surface";

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

function LogoutIcon() {
  return (
    <svg aria-hidden="true" className="size-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
    </svg>
  );
}

interface MobileHeaderBarProps {
  isOpen: boolean;
}

function MobileHeaderBar({ isOpen }: MobileHeaderBarProps) {
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

      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls="mobile-nav-menu"
          aria-label={copy.openMenu}
          className="p-2 rounded-lg text-[#1A2B48] hover:bg-[#F4F1EE] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147560]"
        >
          <MenuIcon />
        </button>
      </Dialog.Trigger>
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

function DrawerFooter() {
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

interface MobileDrawerProps {
  profile: AdminProfile;
  onClose: () => void;
}

function MobileDrawer({ profile, onClose }: MobileDrawerProps) {
  const copy = translations.navigation;

  return (
    <DialogSurface
      overlayClassName=""
      id="mobile-nav-menu"
      aria-label={copy.mainNav}
      className="fixed inset-y-0 left-0 z-50 w-4/5 max-w-xs bg-white shadow-xl flex flex-col justify-between overflow-y-auto"
    >
      <Dialog.Title className="sr-only">{copy.mainNav}</Dialog.Title>
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

        <AdminNavigation onNavigate={onClose} />
      </div>

      <DrawerFooter />
    </DialogSurface>
  );
}

export function MobileHeader({ profile, className = "" }: MobileHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <div className={`bg-white border-b border-[#1A2B48]/10 ${className}`.trim()}>
        <MobileHeaderBar isOpen={isOpen} />
        <MobileDrawer profile={profile} onClose={() => setIsOpen(false)} />
      </div>
    </Dialog.Root>
  );
}
