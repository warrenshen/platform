import StatusChip from "components/Shared/Chip/StatusChip";
import {
  NewPurchaseOrderStatus,
  NewPurchaseOrderStatusToLabel,
} from "lib/enum";

interface Props {
  purchaseOrderStatus: NewPurchaseOrderStatus;
}

const StatusToColor = {
  // Not Ready
  [NewPurchaseOrderStatus.Draft]: "#939393", // Gray
  [NewPurchaseOrderStatus.PendingApprovalByVendor]: "#ffc96b;", // Yellow
  [NewPurchaseOrderStatus.ChangesRequestedByVendor]: "#ee95a1", // light Pink
  [NewPurchaseOrderStatus.ChangesRequestedByBespoke]: "#d6709b", // Pink
  // Ready
  [NewPurchaseOrderStatus.ReadyToRequestFinancing]: "#6da7C0", // Periwinkle
  [NewPurchaseOrderStatus.FinancingPendingApproval]: "#cf8937", // Sand
  [NewPurchaseOrderStatus.FinancingRequestApproved]: "#7dcb9d", // Seafoam Green
  // Closed
  [NewPurchaseOrderStatus.Archived]: "#594ca4", // Blue
  [NewPurchaseOrderStatus.RejectedByVendor]: "#c85d56", // dark Pink
  [NewPurchaseOrderStatus.RejectedByBespoke]: "#a4453f", // Red
};

export default function PurchaseOrderStatusChip({
  purchaseOrderStatus,
}: Props) {
  return (
    <>
      {!!purchaseOrderStatus && (
        <StatusChip
          color={StatusToColor[purchaseOrderStatus]}
          text={NewPurchaseOrderStatusToLabel[purchaseOrderStatus]}
        />
      )}
    </>
  );
}
