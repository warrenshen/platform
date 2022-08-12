import { PurchaseOrderFragment } from "generated/graphql";
import {
  computePurchaseOrderDueDateCutoffDate,
  dateAsDateStringClient,
  dateAsDateStringServer,
  dateStringPlusXDaysDate,
} from "lib/date";

export function computePurchaseOrderDueDate(
  order_date: string | null | undefined,
  net_terms: number | null | undefined
) {
  return !!order_date && net_terms != null
    ? dateStringPlusXDaysDate(order_date, net_terms)
    : null;
}

export function computePurchaseOrderDueDateDateStringClient(
  purchaseOrder: PurchaseOrderFragment
) {
  const dueDateDate = computePurchaseOrderDueDate(
    purchaseOrder.order_date,
    purchaseOrder.net_terms as number
  );
  return !!dueDateDate ? dateAsDateStringClient(dueDateDate) : "-";
}

export function computePurchaseOrderDueDateDateClient(
  purchaseOrder: PurchaseOrderFragment
) {
  const dueDateDate = computePurchaseOrderDueDate(
    purchaseOrder.order_date,
    purchaseOrder.net_terms as number
  );
  return !!dueDateDate ? dueDateDate : null;
}

export function isPurchaseOrderDueDateValid(
  orderDate: string | null | undefined,
  netTerms: number | null | undefined
) {
  const dueDateDate =
    !!orderDate && netTerms != null
      ? dateStringPlusXDaysDate(orderDate, netTerms)
      : null;
  return {
    isDueDateValid:
      !!dueDateDate &&
      dateAsDateStringServer(dueDateDate) >=
        computePurchaseOrderDueDateCutoffDate(),
    dueDateDate: dueDateDate,
  };
}
