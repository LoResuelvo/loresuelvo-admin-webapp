export type Profile = Readonly<{
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "consumer" | "provider";
}>;

export type AdminProfile = Profile & Readonly<{ role: "admin" }>;

export function isAdministrator(profile: Profile): profile is AdminProfile {
  return profile.role === "admin";
}
