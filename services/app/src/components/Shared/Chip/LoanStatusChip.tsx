import { Typography } from "@material-ui/core";
import { LoanStatusEnum } from "generated/graphql";
import { LoanStatusToLabel } from "lib/enum";
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
  loanStatus: LoanStatusEnum;
}

const StatusToColor = {
  [LoanStatusEnum.Drafted]: "#bdc3c7", // Gray
  [LoanStatusEnum.ApprovalRequested]: "#f1c40f", // Yellow
  [LoanStatusEnum.Approved]: "#2ecc71", // Green
  [LoanStatusEnum.Rejected]: "#e67e22", // Orange
  [LoanStatusEnum.PastDue]: "#e74c3c", // Red
  [LoanStatusEnum.Funded]: "#3498db", // Blue
  [LoanStatusEnum.Closed]: "#9b59b6", // Purple
  [LoanStatusEnum.Closing]: "#9b59b6",
};

export default function LoanStatusChip({ loanStatus }: Props) {
  return (
    <Chip backgroundColor={StatusToColor[loanStatus]}>
      <Text>{LoanStatusToLabel[loanStatus]}</Text>
    </Chip>
  );
}
