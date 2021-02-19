// Accepts paymentDate in 'yyyy-MM-dd' format.
export function computeSettlementDateForPayment(
  paymentDate: string | null,
  paymentMethod: string | null | undefined
) {
  if (!paymentDate || !paymentMethod) {
    return null;
  } else {
    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    return paymentDate;
  }
}
