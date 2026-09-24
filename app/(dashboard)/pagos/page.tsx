import { translations } from "@/infrastructure/i18n/translations";
import { PaymentsPageClient } from "@/components/payments/payments-page-client";

export default function PaymentsPage() {
  const copy = translations.payments;

  return (
    <section aria-label={copy.title} className="max-w-7xl space-y-6">
      <PaymentsPageClient />
    </section>
  );
}
