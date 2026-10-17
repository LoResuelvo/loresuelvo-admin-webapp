export function formatMoney(cents: number, currency: string): string {
  const amount = cents / 100;
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    currencyDisplay: currency === "ARS" ? "symbol" : "code",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(amount)
    .replace(/\u00a0/g, " ");
}

export function formatMoneyArs(cents: number): string {
  return formatMoney(cents, "ARS");
}
