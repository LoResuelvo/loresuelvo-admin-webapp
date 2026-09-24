import Link from "next/link";
import type { ConsumerHistoryItem } from "@/domain/users/consumer-history";
import { translations } from "@/infrastructure/i18n/translations";
import { ROUTES } from "@/lib/routes";

export interface ConsumerHistoryListProps {
  history: ConsumerHistoryItem[];
}

const STATUS_STYLES: Record<string, string> = {
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
};

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

function formatAmount(cents: number): string {
  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(cents / 100);
  } catch {
    return `$${cents / 100}`;
  }
}

function ConsumerHistoryRow({ item }: { item: ConsumerHistoryItem }) {
  const copy = translations.users.consumerDetail.history;
  const statusClass =
    STATUS_STYLES[item.status] ?? "bg-gray-100 text-gray-700 border-gray-200";
  const statusLabel =
    (copy.statuses as Record<string, string>)[item.status] ?? item.status;

  return (
    <tr className="transition-colors hover:bg-[#F4F1EE]/30">
      <td className="px-6 py-4 whitespace-nowrap text-[#536176]">
        {formatDate(item.createdAt)}
      </td>
      <td className="px-6 py-4 font-medium text-[#1A2B48]">
        {item.categoryName}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {item.provider.profilePhotoUrl ? (
            <img
              src={item.provider.profilePhotoUrl}
              alt={item.provider.name}
              className="size-7 rounded-full object-cover border border-[#1A2B48]/10"
            />
          ) : (
            <div
              aria-label={item.provider.name}
              className="flex size-7 items-center justify-center rounded-full bg-[#1A2B48]/10 font-bold text-xs text-[#1A2B48]"
            >
              {item.provider.name.charAt(0)}
            </div>
          )}
          <span className="font-medium text-[#1A2B48]">{item.provider.name}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusClass}`}
        >
          {statusLabel}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap font-medium text-[#1A2B48]">
        {formatAmount(item.totalAmountCents)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <Link
          href={ROUTES.operationDetail(item.operationId)}
          className="inline-flex items-center rounded-lg border border-[#147560]/30 bg-white px-3 py-1.5 text-xs font-medium text-[#147560] transition-colors hover:bg-[#147560]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147560]"
        >
          {copy.viewOperation}
        </Link>
      </td>
    </tr>
  );
}

function ConsumerHistoryEmpty() {
  const copy = translations.users.consumerDetail.history;

  return (
    <div
      role="status"
      className="p-12 text-center text-[#536176]"
    >
      <p className="text-base font-medium">{copy.empty}</p>
    </div>
  );
}

export function ConsumerHistoryList({ history }: ConsumerHistoryListProps) {
  const copy = translations.users.consumerDetail.history;
  const { columns } = copy;

  return (
    <section
      data-testid="consumer-history-list"
      aria-label={copy.title}
      className="rounded-2xl border border-[#1A2B48]/10 bg-white shadow-xs overflow-hidden"
    >
      <header className="border-b border-[#1A2B48]/10 p-6">
        <h2 className="text-lg font-bold tracking-tight text-[#1A2B48]">
          {copy.title}
        </h2>
        <p className="mt-1 text-sm text-[#536176]">{copy.subtitle}</p>
      </header>

      {history.length === 0 ? (
        <ConsumerHistoryEmpty />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#1A2B48]">
            <thead className="border-b border-[#1A2B48]/10 bg-[#F4F1EE]/50 text-xs font-semibold uppercase tracking-wider text-[#1A2B48]/60">
              <tr>
                <th scope="col" className="px-6 py-4">{columns.date}</th>
                <th scope="col" className="px-6 py-4">{columns.category}</th>
                <th scope="col" className="px-6 py-4">{columns.provider}</th>
                <th scope="col" className="px-6 py-4">{columns.status}</th>
                <th scope="col" className="px-6 py-4">{columns.amount}</th>
                <th scope="col" className="px-6 py-4 text-right">{columns.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2B48]/5">
              {history.map((item) => (
                <ConsumerHistoryRow
                  key={`${item.resourceType}-${item.resourceId}`}
                  item={item}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
