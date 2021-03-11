import { IdProps } from "components/Artifacts/interfaces";
import PurchaseOrderInfoCard from "components/PurchaseOrder/PurchaseOrderInfoCard";
import { usePurchaseOrderQuery } from "generated/graphql";

export default function PurchaseOrderInfoCardById({ id }: IdProps) {
  const { data } = usePurchaseOrderQuery({
    variables: {
      id,
    },
  });

  const purchaseOrder = data?.purchase_orders_by_pk;
  if (!purchaseOrder) {
    return null;
  }
  return <PurchaseOrderInfoCard purchaseOrder={purchaseOrder} />;
}
