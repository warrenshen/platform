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
  getDifferenceInDays,
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
  const dueDate = computePurchaseOrderDueDate(
    purchaseOrder.order_date,
    purchaseOrder.net_terms as number
  );
  return !!dueDate
    ? parseDateStringServer(dateAsDateStringServer(dueDate))
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

export function isPurchaseOrderCurrentlyFundable(
  purchaseOrder: PurchaseOrderFragment
): boolean {
  const dueDate = computePurchaseOrderDueDate(
    purchaseOrder.order_date,
    purchaseOrder.net_terms as number
  );

  // The due date should always be populated, but
  // if parseDateStringServer fails, this implies
  // a malformed date. A malformed date suggests that
  // something has gone very wrong in the data and
  // that we should investigate before funding
  const diffDays = !!dueDate
    ? getDifferenceInDays(dueDate, new Date())
    : Number.MIN_SAFE_INTEGER;

  // 60 calendar days past the due date is the latest
  // date we will approve funding for, the negative is
  // due to parameter ordering in getDifferenceInDays
  return diffDays > -60;
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
