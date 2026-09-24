import { translations } from "@/infrastructure/i18n/translations";

export interface ProviderProfileHeaderProps {
  name: string;
  surname: string;
  email: string;
  phone: string;
  profilePhotoUrl?: string;
  category: {
    id: number;
    name: string;
  };
}

export function ProviderProfileHeader({
  name,
  surname,
  email,
  phone,
  profilePhotoUrl,
  category,
}: ProviderProfileHeaderProps) {
  const fullName = `${name} ${surname}`.trim();
  const initials = `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
  const copy = translations.users.diagnostic.profile;

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-[#1A2B48]/10 bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        {profilePhotoUrl ? (
          <img
            src={profilePhotoUrl}
            alt={fullName}
            className="size-16 rounded-full border border-[#1A2B48]/10 object-cover"
          />
        ) : (
          <div
            aria-label={fullName}
            className="flex size-16 items-center justify-center rounded-full bg-[#1A2B48]/10 font-bold text-lg text-[#1A2B48]"
          >
            {initials}
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#1A2B48] sm:text-2xl">
            {fullName}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#536176]">
            <span>
              <strong className="font-medium text-[#1A2B48]/70">{copy.emailLabel}:</strong>{" "}
              {email}
            </span>
            <span aria-hidden="true" className="text-[#1A2B48]/20">
              •
            </span>
            <span>
              <strong className="font-medium text-[#1A2B48]/70">{copy.phoneLabel}:</strong>{" "}
              {phone}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-start gap-1 rounded-xl bg-[#F4F1EE]/50 px-4 py-3 sm:items-end">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#1A2B48]/60">
          {copy.categoryLabel}
        </span>
        <span className="inline-flex items-center rounded-lg bg-[#147560]/10 px-3 py-1 font-semibold text-sm text-[#147560]">
          {category.name}
        </span>
      </div>
    </div>
  );
}
