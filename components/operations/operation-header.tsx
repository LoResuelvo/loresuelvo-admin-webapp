import type { OperationStatus } from "@/domain/operations/operation-summary";
import { translations } from "@/infrastructure/i18n/translations";

export interface OperationPartyHeaderInfo {
  readonly id: number;
  readonly name: string;
  readonly surname: string;
  readonly email?: string | null;
  readonly profilePhotoUrl?: string | null;
}

export interface OperationHeaderProps {
  readonly id: string;
  readonly status: OperationStatus | null;
  readonly category: {
    readonly id: number;
    readonly name: string;
  } | null;
  readonly consumer: OperationPartyHeaderInfo;
  readonly provider: OperationPartyHeaderInfo;
  readonly currentAddress: string | null;
  readonly overdueScheduledDate?: string;
  readonly overdueOrderStatus?: string;
  readonly onInspectChat?: () => void;
}

function PartyCard({
  roleLabel,
  party,
  href,
}: {
  roleLabel: string;
  party: OperationPartyHeaderInfo;
  href: string;
}) {
  const fullName = `${party.name} ${party.surname}`.trim();
  const initials = `${party.name.charAt(0)}${party.surname.charAt(0)}`.toUpperCase();

  return (
    <div className="flex items-start gap-3 py-2">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#f1f3f5] font-semibold text-[#147560]">
        {party.profilePhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={party.profilePhotoUrl}
            alt={fullName}
            className="size-11 rounded-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-xs font-medium text-[#536176]">
          {roleLabel}
        </span>
        <Link href={href} className="block truncate text-base font-semibold text-[#147560] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147560]">{fullName}</Link>
        {party.email && <p className="truncate text-sm text-[#536176]">{party.email}</p>}
      </div>
    </div>
  );
}

function HeaderTopBar({
  id,
  categoryName,
  status,
  onInspectChat,
}: {
  id: string;
  categoryName: string;
  status: OperationStatus | null;
  onInspectChat?: () => void;
}) {
  const statusLabel = status ? translations.operations.status[status] : translations.operations.unavailable;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1A2B48]/10 pb-4">
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm font-semibold text-[#536176]">#{id}</span>
        <span className="inline-flex items-center rounded-md bg-[#147560]/10 px-2.5 py-1 text-xs font-semibold text-[#147560]">
          {categoryName}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {onInspectChat && (
          <button
            type="button"
            onClick={onInspectChat}
            data-testid="inspect-chat-button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#147560]/20 bg-[#147560]/5 px-3 py-1 text-xs font-semibold text-[#147560] transition-colors hover:bg-[#147560]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147560]"
          >
            <svg
              aria-hidden="true"
              className="size-3.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
              />
            </svg>
            <span>{translations.operations.chat.inspectButton}</span>
          </button>
        )}
        <span
          className="inline-flex items-center rounded-sm bg-[#f1f3f5] px-2 py-1 text-xs font-medium text-[#405064]"
        >
          {statusLabel}
        </span>
      </div>
    </div>
  );
}

function AddressCard({ address }: { address: string }) {
  return (
    <div className="border-l border-[#dce1e5] pl-4">
      <div className="flex items-center gap-2 text-xs font-medium text-[#536176]">
        <svg
          aria-hidden="true"
          className="size-4 shrink-0 text-[#147560]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
          />
        </svg>
        <span>{translations.operations.detail.registeredAddress}</span>
      </div>
      <p className="mt-1 text-sm font-medium text-[#1A2B48]">{address}</p>
    </div>
  );
}

export function OperationHeader({
  id,
  status,
  category,
  consumer,
  provider,
  currentAddress,
  overdueScheduledDate,
  overdueOrderStatus,
  onInspectChat,
}: OperationHeaderProps) {
  return (
    <section
      data-testid="operation-header"
      aria-label={translations.operations.detail.information}
      className="space-y-4 admin-detail-section"
    >
      <HeaderTopBar
        id={id}
        categoryName={category?.name ?? translations.operations.unavailable}
        status={status}
        onInspectChat={onInspectChat}
      />
      {overdueScheduledDate && overdueOrderStatus && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900"
        >
          <span aria-hidden="true" className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold">!</span>
          <div>
            <p className="text-sm font-semibold">{translations.operations.detail.scheduleWarningTitle}</p>
            <p className="mt-0.5 text-sm">
              {translations.operations.detail.scheduleWarning
                .replace("{date}", overdueScheduledDate)
                .replace("{status}", overdueOrderStatus)}
            </p>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <PartyCard roleLabel={translations.operations.responsible.consumer} party={consumer} href={ROUTES.consumerDetail(consumer.id)} />
        <PartyCard roleLabel={translations.operations.responsible.provider} party={provider} href={ROUTES.providerDetail(provider.id)} />
      </div>
      <AddressCard address={currentAddress ?? translations.operations.unavailable} />
    </section>
  );
}
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
