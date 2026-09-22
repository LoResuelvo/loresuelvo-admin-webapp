"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, ReactNode } from "react";

export interface NavLinkProps extends Omit<ComponentProps<typeof Link>, "children"> {
  href: string;
  children: ReactNode;
  activeClassName?: string;
  exact?: boolean;
}

export function NavLink({
  href,
  children,
  className = "",
  activeClassName = "",
  exact = false,
  ...props
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive = exact
    ? pathname === href
    : pathname === href || (pathname.startsWith(`${href}/`) && href !== "/");

  const combinedClassName = [className, isActive ? activeClassName : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={combinedClassName}
      {...props}
    >
      {children}
    </Link>
  );
}
