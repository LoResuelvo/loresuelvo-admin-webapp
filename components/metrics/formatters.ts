export function formatDurationMinutes(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined) {
    return "-";
  }
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (minutes < 1440) {
    if (remainingMinutes === 0) {
      return `${hours} h`;
    }
    return `${hours} h ${remainingMinutes} min`;
  }
  const days = Math.floor(minutes / 1440);
  const remainingHours = Math.floor((minutes % 1440) / 60);
  if (remainingHours === 0) {
    return `${days} d`;
  }
  return `${days} d ${remainingHours} h`;
}

export function formatPercentage(value: number | null): string {
  if (value === null) return "—";
  return `${Math.round(value * 100)}%`;
}

export function formatEffectivePeriod(
  from?: string | null,
  to?: string | null,
  timeZone?: string,
): string {
  if (!from || !to) return "-";
  try {
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      ...(timeZone ? { timeZone } : {}),
    };
    const fromDate = new Intl.DateTimeFormat("es-AR", options).format(new Date(from));
    const toDate = new Intl.DateTimeFormat("es-AR", options).format(new Date(to));
    return `${fromDate} – ${toDate}`;
  } catch {
    return `${from} – ${to}`;
  }
}

export function formatObservationDate(
  observedAt?: string | null,
  timeZone?: string,
): string {
  if (!observedAt) return "";
  try {
    const dateOptions: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      ...(timeZone ? { timeZone } : {}),
    };
    const date = new Intl.DateTimeFormat("es-AR", dateOptions).format(new Date(observedAt));
    return timeZone ? `${date} (${timeZone})` : date;
  } catch {
    return observedAt;
  }
}

