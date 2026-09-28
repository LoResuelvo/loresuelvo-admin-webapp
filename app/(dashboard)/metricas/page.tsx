import { translations } from "@/infrastructure/i18n/translations";
import { getFunnelAction } from "./actions";
import { MetricsView } from "@/components/metrics/metrics-view";

export default async function MetricasPage() {
  const result = await getFunnelAction();

  return (
    <section
      aria-label={translations.metrics.title}
      className="max-w-7xl space-y-6"
    >
      <MetricsView initialResult={result} />
    </section>
  );
}
