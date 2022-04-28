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

export function formatPercentage(
  value: number | null,
  defaultIfNull: string = "-"
) {
  return value !== null
    ? `${parseFloat((value * 100).toFixed(5))}%`
    : defaultIfNull;
}

// This function is useful for cases where JS adds unnecessary bits
// of precision to floats, ex. 0.00057 * 100 becomes 0.0569999999995.
export function roundToFiveDigits(value: number | null) {
  return value !== null ? parseFloat(value.toFixed(5)) : null;
}
