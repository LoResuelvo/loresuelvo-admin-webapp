export type PeriodOption = "7d" | "30d" | "90d";

function getMetricsDate(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: "year" | "month" | "day") => {
    const part = parts.find((item) => item.type === type)?.value;
    if (!part) throw new Error(`Missing ${type} from formatted metrics date`);
    return part;
  };

  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function computeDateRange(
  preset: PeriodOption,
  referenceDate: Date = new Date(),
): { from: string; to: string } {
  const days = preset === "7d" ? 7 : preset === "30d" ? 30 : 90;
  const to = getMetricsDate(referenceDate);
  const from = new Date(`${to}T00:00:00.000Z`);
  from.setUTCDate(from.getUTCDate() - days);
  return {
    from: from.toISOString().slice(0, 10),
    to,
  };
}

