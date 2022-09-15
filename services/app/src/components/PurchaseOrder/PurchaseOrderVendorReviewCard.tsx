import CardContainer from "components/Shared/Card/CardContainer";
import CardLine from "components/Shared/Card/CardLine";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { PurchaseOrderLimitedFragment } from "generated/graphql";
import {
  dateAsDateStringClient,
  dateStringPlusXDaysDate,
  formatDateString,
  formatDatetimeString,
  parseDateStringServer,
} from "lib/date";
import { formatCurrency } from "lib/number";

interface Props {
  purchaseOrder: PurchaseOrderLimitedFragment;
  handleClick: () => void;
}

export default function PurchaseOrderVendorReviewCard({
  purchaseOrder,
  handleClick,
}: Props) {
  const dueDate = !!purchaseOrder?.net_terms
    ? dateStringPlusXDaysDate(purchaseOrder.order_date, purchaseOrder.net_terms)
    : parseDateStringServer(purchaseOrder.order_date);

  const orderDate = !!purchaseOrder?.order_date
    ? formatDateString(purchaseOrder.order_date)
    : "";

  const requestedAt = !!purchaseOrder?.requested_at
    ? formatDatetimeString(
        purchaseOrder.requested_at,
        true,
        "Not Yet Requested",
        true
      )
    : "";

  return (
    <CardContainer>
      <Text
        materialVariant="h3"
        isBold
        textVariant={TextVariants.SubHeader}
        handleClick={handleClick}
      >
        {`PO ${purchaseOrder.order_number}`}
      </Text>
      <CardLine labelText={"Buyer"} valueText={purchaseOrder.company.name} />
      <CardLine
        labelText={"Amount"}
        valueText={formatCurrency(purchaseOrder.amount)}
      />
      <CardLine labelText={"PO date"} valueText={orderDate || ""} />
      <CardLine
        labelText={"Due date"}
        valueText={!!dueDate ? dateAsDateStringClient(dueDate) : ""}
      />
      <CardLine
        labelText={"Approval requested at"}
        valueText={requestedAt || ""}
      />
    </CardContainer>
  );
}
