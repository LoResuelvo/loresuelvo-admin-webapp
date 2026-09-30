import { translations } from "@/infrastructure/i18n/translations";
import { getCategoriesAction } from "@/app/(dashboard)/rubros/actions";
import { getFunnelAction } from "./actions";
import { MetricsView } from "@/components/metrics/metrics-view";
import { computeDateRange } from "@/domain/metrics/funnel-date-range";

export default async function MetricasPage() {
  const initialDateRange = computeDateRange("7d");
  const [result, categoriesResult] = await Promise.all([
    getFunnelAction(initialDateRange),
    getCategoriesAction(),
  ]);
  const categoryOptions = categoriesResult.success
    ? categoriesResult.data.map(({ id, name }) => ({ id, name }))
    : [];

  return (
    <section
      aria-label={translations.metrics.title}
      className="max-w-7xl space-y-6"
    >
      <MetricsView
        initialResult={result}
        initialFromDate={initialDateRange.from}
        initialToDate={initialDateRange.to}
        categoryOptions={categoryOptions}
      />
    </section>
  );
}
