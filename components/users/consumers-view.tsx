import Link from "next/link";
import type { Consumer } from "@/domain/users/consumer";
import { translations } from "@/infrastructure/i18n/translations";
import { ROUTES } from "@/lib/routes";

export interface ConsumersViewProps {
  consumers?: Consumer[];
  isLoading?: boolean;
  error?: string | null;
  isForbidden?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onRetry?: () => void;
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

function ConsumersLoading() {
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
        {translations.users.loading}
      </p>
    </div>
  );
}

function ConsumersForbidden() {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-800"
    >
      <p className="font-medium">{translations.users.forbidden}</p>
    </div>
  );
}

function ConsumersError({
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

function ConsumersEmpty() {
  return (
    <div
      role="status"
      className="rounded-2xl border border-[#1A2B48]/10 bg-white p-12 text-center shadow-xs"
    >
      <p className="text-base font-medium text-[#1A2B48]/80">
        {translations.users.empty}
      </p>
    </div>
  );
}

function ConsumerRow({ consumer }: { consumer: Consumer }) {
  const initials = `${consumer.name.charAt(0)}${consumer.surname.charAt(0)}`.toUpperCase();

  return (
    <tr className="transition-colors hover:bg-[#F4F1EE]/30">
      <td className="px-6 py-4 whitespace-nowrap">
        {consumer.profilePhotoUrl ? (
          <img
            src={consumer.profilePhotoUrl}
            alt={`${consumer.name} ${consumer.surname}`}
            className="size-10 rounded-full object-cover border border-[#1A2B48]/10"
          />
        ) : (
          <div
            aria-label={`${consumer.name} ${consumer.surname}`}
            className="flex size-10 items-center justify-center rounded-full bg-[#1A2B48]/10 font-semibold text-xs text-[#1A2B48]"
          >
            {initials}
          </div>
        )}
      </td>
      <td className="px-6 py-4 font-medium text-[#1A2B48]">
        <Link
          href={ROUTES.consumerDetail(consumer.id)}
          className="hover:underline text-[#147560] font-semibold"
        >
          {consumer.name}
        </Link>
      </td>
      <td className="px-6 py-4 font-medium text-[#1A2B48]">{consumer.surname}</td>
      <td className="px-6 py-4 text-[#536176]">{consumer.email}</td>
      <td className="px-6 py-4 text-[#536176]">{formatDate(consumer.createdOn)}</td>
    </tr>
  );
}

function ConsumersTable({ consumers }: { consumers: readonly Consumer[] }) {
  const { columns } = translations.users.table;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#1A2B48]/10 bg-white shadow-xs">
      <table aria-label={translations.users.table.caption} className="w-full text-left text-sm text-[#1A2B48]">
        <thead className="border-b border-[#1A2B48]/10 bg-[#F4F1EE]/50 text-xs font-semibold uppercase tracking-wider text-[#1A2B48]/60">
          <tr>
            <th scope="col" className="px-6 py-4 w-20">{columns.photo}</th>
            <th scope="col" className="px-6 py-4">{columns.name}</th>
            <th scope="col" className="px-6 py-4">{columns.surname}</th>
            <th scope="col" className="px-6 py-4">{columns.email}</th>
            <th scope="col" className="px-6 py-4">{columns.createdOn}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1A2B48]/5">
          {consumers.map((consumer) => (
            <ConsumerRow key={consumer.id} consumer={consumer} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ConsumersView({
  consumers = [],
  isLoading = false,
  error = null,
  isForbidden = false,
  searchQuery = "",
  onSearchChange,
  onRetry,
}: ConsumersViewProps) {
  const { search } = translations.users;

  return (
    <div
      id="panel-consumers"
      role="tabpanel"
      aria-labelledby="tab-consumers"
      className="space-y-6"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <label htmlFor="consumer-search" className="sr-only">
            {search.label}
          </label>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <SearchIcon />
          </div>
          <input
            id="consumer-search"
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={search.placeholder}
            className="w-full rounded-xl border border-[#1A2B48]/15 bg-white py-2.5 pl-10 pr-4 text-sm text-[#1A2B48] placeholder-[#536176] transition-colors focus:border-[#147560] focus:outline-hidden focus:ring-1 focus:ring-[#147560]"
          />
        </div>
      </div>

      {isLoading && <ConsumersLoading />}

      {!isLoading && isForbidden && <ConsumersForbidden />}

      {!isLoading && !isForbidden && error && (
        <ConsumersError error={error} onRetry={onRetry} />
      )}

      {!isLoading && !isForbidden && !error && consumers.length === 0 && (
        <ConsumersEmpty />
      )}

      {!isLoading && !isForbidden && !error && consumers.length > 0 && (
        <ConsumersTable consumers={consumers} />
      )}
    </div>
  );
}
