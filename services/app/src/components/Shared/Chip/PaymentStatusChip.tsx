import { Typography } from "@material-ui/core";
import { LoanStatusEnum } from "generated/graphql";
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
  [LoanStatusEnum.Funded]: "#3498db", // Blue,
  [PaymentStatusEnum.PARTIALLY_PAID]: "#e67e22", // Orange
  [PaymentStatusEnum.PENDING]: "#f1c40f", // Yellow
  [PaymentStatusEnum.SCHEDULED]: "#f1c40f", // Yellow
  [PaymentStatusEnum.CLOSED]: "#9b59b6", // Purple
};

function PaymentStatusChip({ paymentStatus }: Props) {
  return (
    <Chip
      backgroundColor={
        StatusToColor[
          [
            PaymentStatusEnum.PARTIALLY_PAID,
            PaymentStatusEnum.PENDING,
            PaymentStatusEnum.SCHEDULED,
            PaymentStatusEnum.CLOSED,
          ].includes(paymentStatus)
            ? paymentStatus
            : LoanStatusEnum.Funded
        ]
      }
    >
      <Text>
        {[
          PaymentStatusEnum.PARTIALLY_PAID,
          PaymentStatusEnum.PENDING,
          PaymentStatusEnum.SCHEDULED,
          PaymentStatusEnum.CLOSED,
        ].includes(paymentStatus)
          ? PaymentStatusToLabel[paymentStatus]
          : "No Payment"}
      </Text>
    </Chip>
  );
}

export default PaymentStatusChip;
