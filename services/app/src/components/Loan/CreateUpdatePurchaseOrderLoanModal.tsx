import CreateUpdateArtifactLoanModal from "components/Artifacts/CreateUpdateArtifactLoanModal";
import PurchaseOrderInfoCardById from "components/PurchaseOrder/PurchaseOrderInfoCardById";
import {
  LoanTypeEnum,
  Scalars,
  useGetFundablePurchaseOrdersQuery,
} from "generated/graphql";
import { ActionType } from "lib/enum";

interface Props {
  actionType: ActionType;
  artifactId: Scalars["uuid"] | null;
  loanId: Scalars["uuid"] | null;
  handleClose: () => void;
}

export default function CreateUpdatePurchaseOrderLoanModal({
  actionType,
  artifactId = null, // this is passed in when a user clicks "Fund" from the Purchase Orders grid
  loanId = null,
  handleClose,
}: Props) {
  // NOTE: This query implicitly has the companyId specified due to the table presets in Hasura
  const { data, loading } = useGetFundablePurchaseOrdersQuery({
    fetchPolicy: "network-only",
  });

  const purchaseOrders = data?.purchase_orders || [];

  const artifactItems = purchaseOrders.map((po) => ({
    id: po.id,
    copy: po.order_number,
  }));

  if (loading) {
    return null;
  }

  return (
    <CreateUpdateArtifactLoanModal
      actionType={actionType}
      artifactId={artifactId}
      loanId={loanId}
      loanType={LoanTypeEnum.PurchaseOrder}
      handleClose={handleClose}
      InfoCard={PurchaseOrderInfoCardById}
      approvedArtifacts={artifactItems}
    />
  );
}
