import { Box, Typography } from "@material-ui/core";
import {
  LoanPaymentStatusEnum,
  LoanPaymentStatusToLabel,
  LoanStatusEnum,
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
  paymentStatus: LoanPaymentStatusEnum;
}

const StatusToColor = {
  [LoanStatusEnum.Funded]: "#3498db", // Blue,
  [LoanPaymentStatusEnum.PARTIALLY_PAID]: "#e67e22", // Orange
  [LoanPaymentStatusEnum.PENDING]: "#f1c40f", // Yellow
  [LoanPaymentStatusEnum.SCHEDULED]: "#f1c40f", // Yellow
  [LoanPaymentStatusEnum.CLOSED]: "#9b59b6", // Purple
};

export default function LoanPaymentStatusChip({ paymentStatus }: Props) {
  return (
    <Box height={33}>
      <Chip
        backgroundColor={
          StatusToColor[
            [
              LoanPaymentStatusEnum.PARTIALLY_PAID,
              LoanPaymentStatusEnum.PENDING,
              LoanPaymentStatusEnum.SCHEDULED,
              LoanPaymentStatusEnum.CLOSED,
            ].includes(paymentStatus)
              ? paymentStatus
              : LoanStatusEnum.Funded
          ]
        }
      >
        <Text>
          {[
            LoanPaymentStatusEnum.PARTIALLY_PAID,
            LoanPaymentStatusEnum.PENDING,
            LoanPaymentStatusEnum.SCHEDULED,
            LoanPaymentStatusEnum.CLOSED,
          ].includes(paymentStatus)
            ? LoanPaymentStatusToLabel[paymentStatus]
            : "No Payment"}
        </Text>
      </Chip>
    </Box>
  );
}
