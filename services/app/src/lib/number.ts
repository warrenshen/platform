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

export const PercentPrecision = 5;
export const CurrencyPrecision = 2;

export function formatPercentage(
  value: number | null,
  defaultIfNull: string = "-"
) {
  return value !== null
    ? `${parseFloat((value * 100).toFixed(PercentPrecision))}%`
    : defaultIfNull;
}

// This function is useful for cases where JS adds unnecessary bits
// of precision to floats, ex. 0.00057 * 100 becomes 0.0569999999995.
export function roundToFiveDigits(value: number | null) {
  return value !== null ? parseFloat(value.toFixed(5)) : null;
}

export const floatEq = (a: number, b: number, epsilon = 0.0001) => {
  if (!a || !b) {
    return false;
  }
  return Math.abs(a - b) < epsilon;
};
