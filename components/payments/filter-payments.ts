import type { PaymentIntentSummary } from "./types";

export interface PaymentFilterCriteria {
  query?: string;
  purpose?: string;
  status?: string;
}

function matchesText(text: string | null | undefined, query: string): boolean {
  if (!text) return false;
  return text.toLowerCase().includes(query);
}

function matchesSearchQuery(item: PaymentIntentSummary, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  return (
    matchesText(item.externalReference, q) ||
    matchesText(item.externalPaymentId, q) ||
    String(item.id).includes(q) ||
    matchesText(item.consumer?.name, q) ||
    matchesText(item.consumer?.email, q) ||
    matchesText(item.provider?.name, q) ||
    matchesText(item.provider?.email, q)
  );
}

export function filterPayments(
  items: readonly PaymentIntentSummary[],
  criteria: PaymentFilterCriteria,
): PaymentIntentSummary[] {
  return items.filter((item) => {
    if (criteria.query && !matchesSearchQuery(item, criteria.query)) {
      return false;
    }
    if (criteria.purpose && item.purpose !== criteria.purpose) {
      return false;
    }
    if (criteria.status && item.status !== criteria.status) {
      return false;
    }
    return true;
  });
}
