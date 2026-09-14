import type { AdminProfile } from "@/domain/auth/admin-profile";
import { ROUTES } from "@/lib/routes";
import type { CustomWorld } from "./world";

export function anAdminProfile(overrides: Partial<AdminProfile> = {}): AdminProfile {
  return { id: 1, firstName: "Ana", lastName: "Pérez", email: "ana@example.com", role: "admin", ...overrides };
}

export async function stubAdminAccess(world: CustomWorld, profile: AdminProfile): Promise<void> {
  await world.page.route(new URL(ROUTES.adminAccess, world.appUrl).href, route => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ status: "ready", profile }),
  }));
}

export async function stubRefreshedAdminAccess(world: CustomWorld): Promise<void> {
  await world.page.route(new URL(ROUTES.adminAccess, world.appUrl).href, route => {
    world.adminAccessRequestCount += 1;
    const profile = anAdminProfile({ lastName: world.adminAccessRequestCount > 1 ? "Pérez García" : "Pérez" });
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ status: "ready", profile }) });
  });
}
