import { IdProps } from "components/Artifacts/interfaces";
import PurchaseOrderInfoCard from "components/PurchaseOrder/PurchaseOrderInfoCard";
import { useGetPurchaseOrderForCustomerQuery } from "generated/graphql";

export default function PurchaseOrderInfoCardById({ id }: IdProps) {
  const { data } = useGetPurchaseOrderForCustomerQuery({
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
