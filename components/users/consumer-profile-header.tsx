import { translations } from "@/infrastructure/i18n/translations";

export interface ConsumerCoverageZone {
  id: number;
  name: string;
}

export interface ConsumerProfileHeaderProps {
  name: string;
  surname: string;
  email: string;
  phone: string;
  profilePhotoUrl?: string;
  registeredAt: string;
  currentAddress: string;
  coverageZone: ConsumerCoverageZone;
}

function formatDate(isoOrDate: string): string {
  try {
    const parts = isoOrDate.split("T")[0].split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    return isoOrDate;
  } catch {
    return isoOrDate;
  }
}

function ConsumerAvatar({
  fullName,
  profilePhotoUrl,
}: {
  fullName: string;
  profilePhotoUrl?: string;
}) {
  const initials = fullName
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (profilePhotoUrl) {
    return (
      <img
        src={profilePhotoUrl}
        alt={fullName}
        className="size-16 rounded-full border border-[#1A2B48]/10 object-cover"
      />
    );
  }

  return (
    <div
      aria-label={fullName}
      className="flex size-16 items-center justify-center rounded-full bg-[#1A2B48]/10 font-bold text-lg text-[#1A2B48]"
    >
      {initials}
    </div>
  );
}

function ConsumerContactInfo({
  email,
  phone,
  registeredAt,
}: {
  email: string;
  phone: string;
  registeredAt: string;
}) {
  const copy = translations.users.consumerDetail.profile;

  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#536176]">
      <span>
        <strong className="font-medium text-[#1A2B48]/70">{copy.emailLabel}:</strong> {email}
      </span>
      <span aria-hidden="true" className="text-[#1A2B48]/20">•</span>
      <span>
        <strong className="font-medium text-[#1A2B48]/70">{copy.phoneLabel}:</strong> {phone}
      </span>
      <span aria-hidden="true" className="text-[#1A2B48]/20">•</span>
      <span>
        <strong className="font-medium text-[#1A2B48]/70">{copy.registeredAtLabel}:</strong> {formatDate(registeredAt)}
      </span>
    </div>
  );
}

function ConsumerAddressBadge({
  currentAddress,
  coverageZone,
}: {
  currentAddress: string;
  coverageZone: ConsumerCoverageZone;
}) {
  const copy = translations.users.consumerDetail.profile;

  return (
    <div className="flex flex-col items-start gap-1 rounded-xl bg-[#F4F1EE]/50 px-4 py-3 sm:items-end">
      <span className="text-xs font-semibold uppercase tracking-wider text-[#1A2B48]/60">
        {copy.addressLabel}
      </span>
      <span className="font-semibold text-sm text-[#1A2B48]">{currentAddress}</span>
      <span className="inline-flex items-center rounded-lg bg-[#147560]/10 px-2.5 py-0.5 font-medium text-xs text-[#147560]">
        {coverageZone.name}
      </span>
    </div>
  );
}

export function ConsumerProfileHeader({
  name,
  surname,
  email,
  phone,
  profilePhotoUrl,
  registeredAt,
  currentAddress,
  coverageZone,
}: ConsumerProfileHeaderProps) {
  const fullName = `${name} ${surname}`.trim();

  return (
    <div
      data-testid="consumer-profile-header"
      className="flex flex-col gap-6 rounded-2xl border border-[#1A2B48]/10 bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-4">
        <ConsumerAvatar fullName={fullName} profilePhotoUrl={profilePhotoUrl} />
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#1A2B48] sm:text-2xl">
            {fullName}
          </h1>
          <ConsumerContactInfo email={email} phone={phone} registeredAt={registeredAt} />
        </div>
      </div>

      <ConsumerAddressBadge currentAddress={currentAddress} coverageZone={coverageZone} />
    </div>
  );
}
