import type { OperationStatus } from "@/domain/operations/operation-summary";

export interface OperationPartyHeaderInfo {
  readonly id: number;
  readonly name: string;
  readonly surname: string;
  readonly email: string;
  readonly profilePhotoUrl?: string | null;
}

export interface OperationHeaderProps {
  readonly id: string;
  readonly status: OperationStatus;
  readonly category: {
    readonly id: number;
    readonly name: string;
  };
  readonly consumer: OperationPartyHeaderInfo;
  readonly provider: OperationPartyHeaderInfo;
  readonly currentAddress: string;
}

const statusLabels: Record<OperationStatus, string> = {
  requested: "Solicitado",
  quoted: "Cotizado",
  in_progress: "En progreso",
  completed: "Completado",
  cancelled: "Cancelado",
};

const statusStyles: Record<OperationStatus, string> = {
  requested: "bg-blue-50 text-blue-700 border-blue-200",
  quoted: "bg-amber-50 text-amber-700 border-amber-200",
  in_progress: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-slate-100 text-slate-700 border-slate-300",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

function PartyCard({
  roleLabel,
  party,
}: {
  roleLabel: string;
  party: OperationPartyHeaderInfo;
}) {
  const fullName = `${party.name} ${party.surname}`.trim();
  const initials = `${party.name.charAt(0)}${party.surname.charAt(0)}`.toUpperCase();

  return (
    <div className="flex items-start gap-3 rounded-xl border border-[#1A2B48]/10 bg-white p-4 shadow-2xs">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#147560]/10 font-semibold text-[#147560]">
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
        <span className="text-xs font-semibold uppercase tracking-wider text-[#536176]">
          {roleLabel}
        </span>
        <p className="truncate text-base font-semibold text-[#1A2B48]">{fullName}</p>
        <p className="truncate text-sm text-[#536176]">{party.email}</p>
      </div>
    </div>
  );
}

function HeaderTopBar({
  id,
  categoryName,
  status,
}: {
  id: string;
  categoryName: string;
  status: OperationStatus;
}) {
  const statusLabel = statusLabels[status] ?? status;
  const statusStyle = statusStyles[status] ?? "bg-slate-50 text-slate-600 border-slate-200";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1A2B48]/10 pb-4">
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm font-semibold text-[#536176]">#{id}</span>
        <span className="inline-flex items-center rounded-md bg-[#147560]/10 px-2.5 py-1 text-xs font-semibold text-[#147560]">
          {categoryName}
        </span>
      </div>
      <span
        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusStyle}`}
      >
        {statusLabel}
      </span>
    </div>
  );
}

function AddressCard({ address }: { address: string }) {
  return (
    <div className="rounded-xl border border-[#1A2B48]/10 bg-[#F4F1EE]/40 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#536176]">
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
        <span>Domicilio registrado</span>
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
}: OperationHeaderProps) {
  return (
    <section
      data-testid="operation-header"
      aria-label="Información de la contratación"
      className="space-y-4 rounded-2xl border border-[#1A2B48]/10 bg-white p-6 shadow-xs"
    >
      <HeaderTopBar id={id} categoryName={category.name} status={status} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <PartyCard roleLabel="Cliente" party={consumer} />
        <PartyCard roleLabel="Prestador" party={provider} />
      </div>
      <AddressCard address={currentAddress} />
    </section>
  );
}
