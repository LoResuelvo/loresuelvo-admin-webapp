import { translations } from "@/infrastructure/i18n/translations";

export interface OperationalConditionsPanelProps {
  identityVerification: {
    status: string;
    verifiedAt?: string;
  };
  paymentConnection: {
    isConnected: boolean;
    accountId?: string;
    canReceivePayments: boolean;
  };
  coverageZones: Array<{
    id: number;
    name: string;
    isActive: boolean;
  }>;
  calendarConnection: {
    status: "connected" | "disconnected" | string;
  };
}

function IdentityConditionCard({
  status,
  verifiedAt,
}: {
  status: string;
  verifiedAt?: string;
}) {
  const copy = translations.users.diagnostic.conditions.identity;
  const isApproved = status === "approved";
  const label =
    status in copy.status
      ? copy.status[status as keyof typeof copy.status]
      : status;

  const subtitle =
    status === "approved"
      ? copy.verifiedTitle
      : status === "in_review" || status === "pending"
        ? copy.inReviewTitle
        : status === "unverified"
          ? copy.unverifiedTitle
          : copy.pendingTitle;

  return (
    <div className="flex flex-col justify-between rounded-xl border border-[#1A2B48]/10 bg-white p-5 shadow-2xs">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#1A2B48]/60">
            {copy.title}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs ${
              isApproved
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            {label}
          </span>
        </div>
        <p className="mt-3 text-sm font-semibold text-[#1A2B48]">
          {subtitle}
        </p>
      </div>
      {verifiedAt && (
        <span className="mt-4 text-xs text-[#536176]">
          {copy.verifiedAtLabel}: {new Date(verifiedAt).toLocaleDateString("es-AR")}
        </span>
      )}
    </div>
  );
}

function PaymentConditionCard({
  paymentConnection,
}: {
  paymentConnection: OperationalConditionsPanelProps["paymentConnection"];
}) {
  const copy = translations.users.diagnostic.conditions.payments;
  const { isConnected, canReceivePayments, accountId } = paymentConnection;

  return (
    <div
      className={`flex flex-col justify-between rounded-xl border p-5 shadow-2xs ${
        isConnected
          ? "border-[#1A2B48]/10 bg-white"
          : "border-red-200 bg-red-50/50"
      }`}
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#1A2B48]/60">
            {copy.title}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs ${
              isConnected
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            {isConnected ? copy.connected : copy.disconnected}
          </span>
        </div>

        <p
          className={`mt-3 text-sm font-semibold ${
            isConnected ? "text-[#1A2B48]" : "text-red-700"
          }`}
        >
          {isConnected ? copy.canReceivePayments : copy.disconnectedAlert}
        </p>
      </div>

      <div className="mt-4 text-xs text-[#536176]">
        {isConnected && accountId ? (
          <span>
            {copy.accountLabel}: <strong className="font-mono">{accountId}</strong>
          </span>
        ) : !canReceivePayments ? (
          <span className="text-red-600 font-medium">
            {copy.disconnectedAlert}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function ZonesConditionCard({
  coverageZones,
}: {
  coverageZones: OperationalConditionsPanelProps["coverageZones"];
}) {
  const copy = translations.users.diagnostic.conditions.zones;
  const activeCount = coverageZones.filter((z) => z.isActive).length;
  const totalCount = coverageZones.length;

  return (
    <div className="flex flex-col justify-between rounded-xl border border-[#1A2B48]/10 bg-white p-5 shadow-2xs">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#1A2B48]/60">
            {copy.title}
          </span>
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 font-medium text-xs text-blue-700 border border-blue-200">
            {activeCount} {copy.active.toLowerCase()}
            {activeCount !== 1 ? "s" : ""}
          </span>
        </div>
        <p className="mt-3 text-sm font-semibold text-[#1A2B48]">
          {totalCount > 0
            ? `${activeCount} de ${totalCount} ${copy.configured}`
            : copy.noZones}
        </p>
      </div>

      {coverageZones.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {coverageZones.map((zone) => (
            <span
              key={zone.id}
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs ${
                zone.isActive
                  ? "bg-[#147560]/10 text-[#147560] font-medium"
                  : "bg-gray-100 text-gray-500 line-through"
              }`}
            >
              {zone.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function CalendarConditionCard({
  status,
}: {
  status: string;
}) {
  const copy = translations.users.diagnostic.conditions.calendar;
  const isConnected = status === "connected";

  return (
    <div className="flex flex-col justify-between rounded-xl border border-[#1A2B48]/10 bg-white p-5 shadow-2xs">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#1A2B48]/60">
            {copy.title}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs ${
              isConnected
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-gray-100 text-gray-700 border border-gray-200"
            }`}
          >
            {isConnected ? copy.connected : copy.disconnected}
          </span>
        </div>
        <p className="mt-3 text-sm font-semibold text-[#1A2B48]">
          {isConnected ? "Sincronización activa" : "Sin sincronizar"}
        </p>
      </div>

      <span className="mt-4 text-xs text-[#536176]">
        {isConnected ? "Google Calendar" : "No vinculado"}
      </span>
    </div>
  );
}

export function OperationalConditionsPanel({
  identityVerification,
  paymentConnection,
  coverageZones,
  calendarConnection,
}: OperationalConditionsPanelProps) {
  const copy = translations.users.diagnostic.conditions;

  return (
    <section
      data-testid="operational-conditions-panel"
      aria-labelledby="operational-conditions-title"
      className="space-y-4"
    >
      <h2
        id="operational-conditions-title"
        className="text-lg font-semibold tracking-tight text-[#1A2B48]"
      >
        {copy.title}
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <IdentityConditionCard
          status={identityVerification.status}
          verifiedAt={identityVerification.verifiedAt}
        />
        <PaymentConditionCard paymentConnection={paymentConnection} />
        <ZonesConditionCard coverageZones={coverageZones} />
        <CalendarConditionCard status={calendarConnection.status} />
      </div>
    </section>
  );
}
