import CreateUpdateArtifactLoanModal from "components/Artifacts/CreateUpdateArtifactLoanModal";
import PurchaseOrderInfoCardById from "components/PurchaseOrder/PurchaseOrderInfoCardById";
import {
  Companies,
  LoanTypeEnum,
  Scalars,
  useGetFundablePurchaseOrdersByCompanyIdQuery,
} from "generated/graphql";
import { ActionType, ProductTypeEnum } from "lib/enum";

interface Props {
  actionType: ActionType;
  companyId: Companies["id"];
  productType: ProductTypeEnum;
  artifactId: Scalars["uuid"] | null;
  loanId: Scalars["uuid"] | null;
  handleClose: () => void;
}

export default function CreateUpdatePurchaseOrderLoanModal({
  actionType,
  companyId,
  productType,
  artifactId = null, // this is passed in when a user clicks "Fund" from the Purchase Orders grid
  loanId = null,
  handleClose,
}: Props) {
  // NOTE: This query implicitly has the companyId specified due to the table presets in Hasura
  const { data, loading, error } = useGetFundablePurchaseOrdersByCompanyIdQuery(
    {
      fetchPolicy: "network-only",
      variables: {
        company_id: companyId,
      },
    }
  );

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const purchaseOrders = data?.purchase_orders || [];

  const artifacts = purchaseOrders.map((po) => ({
    id: po.id,
    copy: po.order_number,
    total_amount: po.amount,
    amount_remaining: po.amount,
  }));

  return (
    <>
      {!loading && (
        <CreateUpdateArtifactLoanModal
          actionType={actionType}
          companyId={companyId}
          productType={productType}
          artifactId={artifactId}
          loanId={loanId}
          loanType={LoanTypeEnum.PurchaseOrder}
          handleClose={handleClose}
          InfoCard={PurchaseOrderInfoCardById}
          artifacts={artifacts}
        />
      )}
    </>
  );
}
