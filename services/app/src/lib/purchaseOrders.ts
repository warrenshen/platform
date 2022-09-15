import {
  PurchaseOrderFileTypeEnum,
  PurchaseOrderFragment,
  PurchaseOrderWithRelationshipsFragment,
} from "generated/graphql";
import {
  computePurchaseOrderDueDateCutoffDate,
  dateAsDateStringClient,
  dateAsDateStringServer,
  dateStringPlusXDaysDate,
  parseDateStringServer,
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

export function computePurchaseOrderDueDateDateStringClientNew(
  purchaseOrder: PurchaseOrderFragment
) {
  const dueDateDate = computePurchaseOrderDueDate(
    purchaseOrder.order_date,
    purchaseOrder.net_terms as number
  );
  return !!dueDateDate
    ? parseDateStringServer(dateAsDateStringServer(dueDateDate))
    : null;
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

export function getPurchaseOrderFilesOfType(
  purchaseOrder: PurchaseOrderWithRelationshipsFragment,
  fileType: PurchaseOrderFileTypeEnum
) {
  return (
    purchaseOrder?.purchase_order_files
      .filter((purchaseOrderFile) => purchaseOrderFile.file_type === fileType)
      .map((purchaseOrderFile) => purchaseOrderFile.file_id) || []
  );
}
