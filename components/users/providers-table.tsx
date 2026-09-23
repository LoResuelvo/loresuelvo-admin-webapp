import type { Provider } from "@/domain/users/provider";
import { translations } from "@/infrastructure/i18n/translations";
import { VerificationBadge } from "./verification-badge";

function ProviderRow({ provider }: { provider: Provider }) {
  const initials = `${provider.name.charAt(0)}${provider.surname.charAt(0)}`.toUpperCase();
  const zonesText = provider.coverageZones.map((z) => z.name).join(", ");

  return (
    <tr className="transition-colors hover:bg-[#F4F1EE]/30">
      <td className="px-6 py-4 whitespace-nowrap">
        {provider.profilePhotoUrl ? (
          <img
            src={provider.profilePhotoUrl}
            alt={`${provider.name} ${provider.surname}`}
            className="size-10 rounded-full object-cover border border-[#1A2B48]/10"
          />
        ) : (
          <div
            aria-label={`${provider.name} ${provider.surname}`}
            className="flex size-10 items-center justify-center rounded-full bg-[#1A2B48]/10 font-semibold text-xs text-[#1A2B48]"
          >
            {initials}
          </div>
        )}
      </td>
      <td className="px-6 py-4 font-medium text-[#1A2B48]">{provider.name}</td>
      <td className="px-6 py-4 font-medium text-[#1A2B48]">{provider.surname}</td>
      <td className="px-6 py-4 text-[#536176]">{provider.email}</td>
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
    <div className="overflow-hidden rounded-2xl border border-[#1A2B48]/10 bg-white shadow-xs">
      <table aria-label={translations.users.providers.table.caption} className="w-full text-left text-sm text-[#1A2B48]">
        <thead className="border-b border-[#1A2B48]/10 bg-[#F4F1EE]/50 text-xs font-semibold uppercase tracking-wider text-[#1A2B48]/60">
          <tr>
            <th scope="col" className="px-6 py-4 w-20">{columns.photo}</th>
            <th scope="col" className="px-6 py-4">{columns.name}</th>
            <th scope="col" className="px-6 py-4">{columns.surname}</th>
            <th scope="col" className="px-6 py-4">{columns.email}</th>
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
