import { Box } from "@material-ui/core";
import CardContainer from "components/Shared/Card/CardContainer";
import CardLine from "components/Shared/Card/CardLine";
import PurchaseOrderStatusChip from "components/Shared/Chip/PurchaseOrderStatusChip";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { PurchaseOrderWithRelationshipsFragment } from "generated/graphql";
import { formatDateString, formatDatetimeString } from "lib/date";
import { NewPurchaseOrderStatus } from "lib/enum";
import { formatCurrency } from "lib/number";
import { computePurchaseOrderDueDateDateStringClient } from "lib/purchaseOrders";

interface Props {
  purchaseOrder: PurchaseOrderWithRelationshipsFragment;
}

export default function PurchaseOrderViewModalCard({ purchaseOrder }: Props) {
  const purchaseOrderStatus = !!purchaseOrder?.new_purchase_order_status
    ? purchaseOrder.new_purchase_order_status
    : null;

  const vendorName = !!purchaseOrder?.vendor?.name
    ? purchaseOrder.vendor.name
    : "";

  const requestedAt = !!purchaseOrder?.requested_at
    ? formatDatetimeString(purchaseOrder.requested_at, false) || ""
    : "";

  const orderDate = !!purchaseOrder?.order_date
    ? formatDateString(purchaseOrder.order_date) || ""
    : "";

  // dueDate cannot follow the !! pattern because 0 is a valid net_terms value
  const dueDate =
    purchaseOrder?.net_terms !== null
      ? computePurchaseOrderDueDateDateStringClient(purchaseOrder)
      : "";

  const amountFunded = !!purchaseOrder?.amount_funded
    ? formatCurrency(purchaseOrder.amount_funded)
    : "$0";

  const customerNote = !!purchaseOrder?.customer_note
    ? purchaseOrder.customer_note
    : "";

  return (
    <CardContainer>
      <Text
        materialVariant="h3"
        isBold
        textVariant={TextVariants.SubHeader}
        bottomMargin={22}
      >
        {`PO ${purchaseOrder.order_number}`}
      </Text>
      <>
        {!!purchaseOrderStatus && (
          <Box mb={"22px"}>
            <PurchaseOrderStatusChip
              purchaseOrderStatus={
                purchaseOrderStatus as NewPurchaseOrderStatus
              }
            />
          </Box>
        )}
      </>
      <CardLine
        labelText={"Customer name"}
        valueText={purchaseOrder.company.name}
      />
      <CardLine labelText={"Vendor"} valueText={vendorName} />
      <CardLine labelText={"Date submitted"} valueText={requestedAt} />
      <CardLine labelText={"PO date"} valueText={orderDate} />
      <CardLine labelText={"Due date"} valueText={dueDate} />
      <CardLine
        labelText={"Amount"}
        valueText={formatCurrency(purchaseOrder.amount)}
      />
      <CardLine labelText={"Amount funded"} valueText={amountFunded} />
      <CardLine labelText={"Comments"} valueText={customerNote} />
    </CardContainer>
  );
}
