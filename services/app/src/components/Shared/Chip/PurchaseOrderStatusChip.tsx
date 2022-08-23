// TODO: THIS IS STUB, CREATE NEW STATUS CHIP
import { Typography } from "@material-ui/core";
// import { NewPurchaseOrderStatus } from "generated/graphql";
import {
  NewPurchaseOrderStatus,
  NewPurchaseOrderStatusToLabel,
} from "lib/enum";
import styled from "styled-components";

const Chip = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  flex: 1;

  width: fit-content;
  height: 30px;
  padding: 6px 8px;
  border-radius: 4px;
  background-color: #f6f5f3;
  color: #2c2a27;
`;

const Text = styled(Typography)`
  font-size: 14px;
  font-weight: 500;
  line-height: 133.3%;
`;

const Dot = styled.div<{ $dotColor: string }>`
  width: 10px;
  height: 10px;
  background-color: ${(props) => props.$dotColor};
  border-radius: 24px;
  margin: 0 11px 0 0;
`;

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
    <Chip>
      <Dot $dotColor={StatusToColor[purchaseOrderStatus]}></Dot>
      <Text>{NewPurchaseOrderStatusToLabel[purchaseOrderStatus]}</Text>
    </Chip>
  );
}
