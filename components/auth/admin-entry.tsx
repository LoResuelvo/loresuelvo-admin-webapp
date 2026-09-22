"use client";

import { AdminShell } from "@/components/admin/admin-shell";
import { AdminWelcome } from "./admin-welcome";

export function AdminEntry() {
  return (
    <AdminShell>
      <AdminWelcome />
    </AdminShell>
  );
}
