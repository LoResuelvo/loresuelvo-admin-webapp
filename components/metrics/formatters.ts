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

function formatCalendarDate(value: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return value;
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatPeriodBoundary(value: string, timeZone?: string): string {
  const calendarDate = formatCalendarDate(value);
  if (calendarDate) return calendarDate;

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    ...(timeZone ? { timeZone } : {}),
  }).format(new Date(value));
}

export function formatEffectivePeriod(
  from?: string | null,
  to?: string | null,
  timeZone?: string,
  exclusiveEndLabel?: string,
): string {
  if (!from || !to) return "-";

  const hasExplicitTimeZoneBoundaries = from.includes("T") && to.includes("T");
  const exclusiveEndSuffix = hasExplicitTimeZoneBoundaries && exclusiveEndLabel
    ? ` ${exclusiveEndLabel}`
    : "";

  try {
    const fromDate = formatPeriodBoundary(from, timeZone);
    const toDate = formatPeriodBoundary(to, timeZone);
    return `${fromDate} – ${toDate}${exclusiveEndSuffix}`;
  } catch {
    return `${from} – ${to}${exclusiveEndSuffix}`;
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
      hourCycle: "h23",
      ...(timeZone ? { timeZone } : {}),
    };
    const date = new Intl.DateTimeFormat("es-AR", dateOptions).format(new Date(observedAt));
    return timeZone ? `${date} (${timeZone})` : date;
  } catch {
    return observedAt;
  }
}

