import CardContainer from "components/Shared/Card/CardContainer";
import CardLine from "components/Shared/Card/CardLine";
import { PurchaseOrderWithRelationshipsFragment } from "generated/graphql";

interface Props {
  purchaseOrder: PurchaseOrderWithRelationshipsFragment;
}

export default function PurchaseOrderViewModalCard({ purchaseOrder }: Props) {
  return (
    <CardContainer>
      <CardLine labelText={"Platform ID"} valueText={purchaseOrder.id} />
      <CardLine
        labelText={"PO bank note"}
        valueText={purchaseOrder.bank_note || ""}
      />
    </CardContainer>
  );
}
