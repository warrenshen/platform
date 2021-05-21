import { Typography } from "@material-ui/core";
import { PaymentStatusEnum, PaymentStatusToLabel } from "lib/enum";
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
  paymentStatus: PaymentStatusEnum;
}

const StatusToColor = {
  [PaymentStatusEnum.AwaitingSubmit]: "#e67e22", // Orange
  [PaymentStatusEnum.AwaitingSettlement]: "#f1c40f", // Yellow
  [PaymentStatusEnum.Settled]: "#2ecc71", // Green
  [PaymentStatusEnum.Reversed]: "#e74c3c", // Red
  [PaymentStatusEnum.Deleted]: "#bdc3c7", // Gray
};

export default function PaymentStatusChip({ paymentStatus }: Props) {
  return (
    <Chip backgroundColor={StatusToColor[paymentStatus]}>
      <Text>{PaymentStatusToLabel[paymentStatus]}</Text>
    </Chip>
  );
}
