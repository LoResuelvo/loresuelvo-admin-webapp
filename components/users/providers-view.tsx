import type { Provider } from "@/domain/users/provider";
import { translations } from "@/infrastructure/i18n/translations";
import { VerificationBadge } from "./verification-badge";

export interface ProvidersViewProps {
  providers?: Provider[];
  isLoading?: boolean;
  error?: string | null;
  isForbidden?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onRetry?: () => void;
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 text-[#536176]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </svg>
  );
}

function ProvidersLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <span
        aria-hidden="true"
        className="mb-4 block size-8 rounded-full border-2 border-[#147560]/20 border-t-[#147560] motion-safe:animate-spin"
      />
      <p className="text-sm font-medium text-[#1A2B48]/70">
        {translations.users.providers.loading}
      </p>
    </div>
  );
}

function ProvidersForbidden() {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-800"
    >
      <p className="font-medium">{translations.users.providers.forbidden}</p>
    </div>
  );
}

function ProvidersError({
  error,
  onRetry,
}: {
  error: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700"
    >
      <p className="font-medium">{error}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center rounded-lg bg-[#147560] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#105F4E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147560]"
        >
          {translations.users.retry}
        </button>
      )}
    </div>
  );
}

function ProvidersEmpty() {
  return (
    <div
      role="status"
      className="rounded-2xl border border-[#1A2B48]/10 bg-white p-12 text-center shadow-xs"
    >
      <p className="text-base font-medium text-[#1A2B48]/80">
        {translations.users.providers.empty}
      </p>
    </div>
  );
}

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

function ProvidersTable({ providers }: { providers: readonly Provider[] }) {
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

export function ProvidersView({
  providers = [],
  isLoading = false,
  error = null,
  isForbidden = false,
  searchQuery = "",
  onSearchChange,
  onRetry,
}: ProvidersViewProps) {
  const { search } = translations.users.providers;

  return (
    <div
      id="panel-providers"
      role="tabpanel"
      aria-labelledby="tab-providers"
      className="space-y-6"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <label htmlFor="provider-search" className="sr-only">
            {search.label}
          </label>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <SearchIcon />
          </div>
          <input
            id="provider-search"
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={search.placeholder}
            className="w-full rounded-xl border border-[#1A2B48]/15 bg-white py-2.5 pl-10 pr-4 text-sm text-[#1A2B48] placeholder-[#536176] transition-colors focus:border-[#147560] focus:outline-hidden focus:ring-1 focus:ring-[#147560]"
          />
        </div>
      </div>

      {isLoading && <ProvidersLoading />}

      {!isLoading && isForbidden && <ProvidersForbidden />}

      {!isLoading && !isForbidden && error && (
        <ProvidersError error={error} onRetry={onRetry} />
      )}

      {!isLoading && !isForbidden && !error && providers.length === 0 && (
        <ProvidersEmpty />
      )}

      {!isLoading && !isForbidden && !error && providers.length > 0 && (
        <ProvidersTable providers={providers} />
      )}
    </div>
  );
}
