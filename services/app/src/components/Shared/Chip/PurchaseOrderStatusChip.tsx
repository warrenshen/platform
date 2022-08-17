// TODO: THIS IS STUB, CREATE NEW STATUS CHIP
import { Typography } from "@material-ui/core";
// import { NewPurchaseOrderStatus } from "generated/graphql";
import {
  NewPurchaseOrderStatus,
  NewPurchaseOrderStatusToLabel,
} from "lib/enum";
import styled from "styled-components";

const Chip = styled.div<{ backgroundColor: string }>`
  display: flex;
  justify-content: center;
  align-items: center;

  flex: 1;

  width: 150px;
  padding: 6px 0px;
  border-radius: 18px;
  background-color: ${(props) => props.backgroundColor};
  color: white;
`;

const Text = styled(Typography)`
  font-size: 14px;
  font-weight: 500;
`;

interface Props {
  purchaseOrderStatus: NewPurchaseOrderStatus;
}

const StatusToColor = {
  [NewPurchaseOrderStatus.Draft]: "#bdc3c7", // Gray
  [NewPurchaseOrderStatus.PendingApprovalByVendor]: "#f1c40f", // Yellow
  [NewPurchaseOrderStatus.ChangesRequestedByVendor]: "#e67e22", // Orange
  [NewPurchaseOrderStatus.ChangesRequestedByBespoke]: "rgba(118, 147, 98, 1)", // Green
  [NewPurchaseOrderStatus.ReadyToRequestFinancing]: "#e66e22", // Orange
  [NewPurchaseOrderStatus.PendingApprovalByBespoke]: "#e66e22", // Orange
  [NewPurchaseOrderStatus.FinancingRequestApproved]: "#e66e22", // Orange
  [NewPurchaseOrderStatus.FullyFinanced]: "#e66e22", // Orange
  [NewPurchaseOrderStatus.Archived]: "#e66e22", // Orange
  [NewPurchaseOrderStatus.RejectedByVendor]: "#e66e22", // Orange
  [NewPurchaseOrderStatus.RejectedByBespoke]: "#e66e22", // Orange
};

export default function PurchaseOrderStatusChip({
  purchaseOrderStatus,
}: Props) {
  return (
    <Chip backgroundColor={StatusToColor[purchaseOrderStatus]}>
      <Text>{NewPurchaseOrderStatusToLabel[purchaseOrderStatus]}</Text>
    </Chip>
  );
}
