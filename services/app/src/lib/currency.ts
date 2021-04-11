export function formatCurrency(
  value: number | null,
  defaultIfNull: string = "-"
) {
  return value !== null
    ? `${Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value)}`
    : defaultIfNull;
}
