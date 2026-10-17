export type VerificationStatus =
  | "unverified"
  | "not_started"
  | "in_progress"
  | "awaiting_user"
  | "in_review"
  | "approved"
  | "declined"
  | "resubmitted"
  | "abandoned"
  | "expired"
  | "kyc_expired";

export type ProviderCoverageZone = Readonly<{
  id: number;
  name: string;
  code: string;
}>;

export type ProviderCategory = Readonly<{
  id: number;
  name: string;
}>;

export type Provider = Readonly<{
  id: number;
  name: string;
  surname: string;
  email: string;
  profilePhotoUrl?: string;
  createdOn: string;
  category: ProviderCategory;
  coverageZones: ReadonlyArray<ProviderCoverageZone>;
  identityVerificationStatus: VerificationStatus;
  identityVerifiedOn?: string;
}>;
