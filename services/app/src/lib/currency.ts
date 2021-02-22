// Expects a number, but if given null will return $0.00.
export function formatCurrency(value: number) {
  return `${Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value)}`;
}
