export function formatCurrency(value: number) {
  return `$${Intl.NumberFormat("en-US").format(value)}`;
}
