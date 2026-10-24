import Link from "next/link";
import type { Provider } from "@/domain/users/provider";
import { translations } from "@/infrastructure/i18n/translations";
import { ROUTES } from "@/lib/routes";
import { VerificationBadge } from "./verification-badge";

function ProviderRow({ provider }: { provider: Provider }) {
  const initials = `${provider.name.charAt(0)}${provider.surname.charAt(0)}`.toUpperCase();
  const zonesText = provider.coverageZones.map((z) => z.name).join(", ");

  return (
    <tr className="transition-colors hover:bg-[#F4F1EE]/30">
      <td className="px-6 py-4">
        <div className="flex min-w-0 items-center gap-3">
          {provider.profilePhotoUrl ? (
            <img
              src={provider.profilePhotoUrl}
              alt={`${provider.name} ${provider.surname}`}
              className="size-10 shrink-0 rounded-full border border-[#1A2B48]/10 object-cover"
            />
          ) : (
            <div
              aria-label={`${provider.name} ${provider.surname}`}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#1A2B48]/10 font-semibold text-xs text-[#1A2B48]"
            >
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <Link
              href={ROUTES.providerDetail(provider.id)}
              className="block truncate font-semibold text-[#147560] hover:underline"
            >
              {provider.name} {provider.surname}
            </Link>
            <p className="mt-0.5 break-all text-xs text-[#536176]">{provider.email}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-[#1A2B48] font-medium">{provider.category.name}</td>
      <td className="px-6 py-4 text-[#536176]">{zonesText}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <VerificationBadge status={provider.identityVerificationStatus} />
      </td>
    </tr>
  );
}

export function ProvidersTable({ providers }: { providers: readonly Provider[] }) {
  const { columns } = translations.users.providers.table;

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#1A2B48]/10 bg-white shadow-xs">
      <table aria-label={translations.users.providers.table.caption} className="w-full min-w-[720px] text-left text-sm text-[#1A2B48]">
        <thead className="border-b border-[#1A2B48]/10 bg-[#F4F1EE]/50 text-xs font-semibold uppercase tracking-wider text-[#1A2B48]/60">
          <tr>
            <th scope="col" className="px-6 py-4">{columns.user}</th>
            <th scope="col" className="px-6 py-4">{columns.category}</th>
            <th scope="col" className="px-6 py-4">{columns.coverageZones}</th>
            <th scope="col" className="px-6 py-4">{columns.verificationStatus}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1A2B48]/5">
          {providers.map((provider) => (
            <ProviderRow key={provider.id} provider={provider} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
