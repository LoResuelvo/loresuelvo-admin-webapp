/** Date-only audit filters follow the Argentina business day (UTC−03:00). */
export function toAuditDateBoundary(value: string, followingDay = false): string | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const instant = new Date(value);
    return Number.isNaN(instant.getTime()) ? undefined : instant.toISOString();
  }

  const calendarDate = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(calendarDate.getTime()) || calendarDate.toISOString().slice(0, 10) !== value) return undefined;
  if (followingDay) calendarDate.setUTCDate(calendarDate.getUTCDate() + 1);
  const day = calendarDate.toISOString().slice(0, 10);
  return new Date(`${day}T00:00:00.000-03:00`).toISOString();
}
