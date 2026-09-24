export function formatMoneyArs(cents: number): string {
  const amount = cents / 100;
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(amount)
    .replace(/\u00a0/g, " ");
}
