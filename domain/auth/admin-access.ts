import type { AdminProfile } from "./admin-profile";

export type AdminAccess =
  | Readonly<{ status: "ready"; profile: AdminProfile }>
  | Readonly<{ status: "unauthenticated" | "sessionExpired" }>
  | Readonly<{ status: "unavailable" }>;
