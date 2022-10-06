import { Box, Card, CardContent } from "@material-ui/core";
import RequestStatusChipNew from "components/Shared/Chip/FinancingRequestStatusChipNew";
import { LoansInsertInput } from "generated/graphql";
import { formatDateString } from "lib/date";
import { LoanStatusEnum } from "lib/enum";
import { formatCurrency } from "lib/number";
import styled from "styled-components";

const Label = styled.span`
  color: #abaaa9;
  font-size: 14px;
  font-weight: 500;
`;
const Value = styled.span`
  color: #2c2a27;
  font-size: 14px;
  font-weight: 700;
`;

const FinancingRequestCard = styled(Card)`
  background-color: #fff;
  padding-top: 8px;
  padding-bottom: 8px;
  padding-left: 8px;
`;

const StyledCardContent = styled(CardContent)`
  padding-right: 8px;
`;

interface Props {
  loan: LoansInsertInput;
  status: LoanStatusEnum;
}

export default function FinancingRequestViewCard({ loan, status }: Props) {
  return (
    <FinancingRequestCard>
      <StyledCardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flex={1}
          >
            <Box display="flex" flexDirection="column">
              <Label>Requested payment date</Label>
              <Value>{formatDateString(loan.requested_payment_date)}</Value>
              <Box m={2} />
              <Label>Amount</Label>
              <Value>{formatCurrency(loan.amount)}</Value>
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              mr={3}
              alignItems="flex-end"
            >
              <Box height={30} mb={5}>
                <RequestStatusChipNew loanStatus={status} />
              </Box>
              <Box display="flex" flexDirection="column">
                <Label style={{ textAlign: "right" }}>Comments</Label>
                <Value
                  style={{
                    textAlign: "right",
                    textOverflow: "ellipsis",
                    maxWidth: 300,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                  }}
                >
                  {loan.customer_notes ? loan.customer_notes : "-"}
                </Value>
              </Box>
            </Box>
          </Box>
          <Box m={3} />
        </Box>
      </StyledCardContent>
    </FinancingRequestCard>
  );
}
