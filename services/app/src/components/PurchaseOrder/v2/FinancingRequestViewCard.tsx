import { Box, Card, CardContent, Divider, IconButton } from "@material-ui/core";
import RequestStatusChipNew from "components/Shared/Chip/RequestStatusChipNew";
import { LoansInsertInput, RequestStatusEnum } from "generated/graphql";
import { EditIcon, TrashIcon } from "icons/index";
import { formatDateString } from "lib/date";
import { formatCurrency } from "lib/number";
import { Dispatch, SetStateAction } from "react";
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
  status: RequestStatusEnum;
  deleteExistingFianancingRequestsIds: Set<string>;
  handleClickAddFinancingRequest: () => void;
  handleClickRemoveNewFinancingRequest: () => void;
  setCurrentlyEditingLoan: (loan: LoansInsertInput) => void;
  deleteFinancingRequestFromState: () => void;
  setDeleteExistingFinancingRequestIds: Dispatch<SetStateAction<Set<string>>>;
}

export default function FinancingRequestViewCard({
  loan,
  status,
  deleteExistingFianancingRequestsIds,
  handleClickAddFinancingRequest,
  handleClickRemoveNewFinancingRequest,
  setCurrentlyEditingLoan,
  deleteFinancingRequestFromState,
  setDeleteExistingFinancingRequestIds,
}: Props) {
  return (
    <FinancingRequestCard>
      <StyledCardContent>
        <Box display="flex" justifyContent="space-between">
          <Box display="flex" flexDirection="column">
            <Label>Requested payment date</Label>
            <Value>{formatDateString(loan.requested_payment_date)}</Value>
            <Box m={2} />
            <Label>Amount</Label>
            <Value>{formatCurrency(loan.amount)}</Value>
          </Box>
          <Box display="flex" flexDirection="column" justifyContent="center">
            <RequestStatusChipNew requestStatus={status} />
          </Box>
          <Box display="flex">
            <Box>
              <Divider orientation="vertical" />
            </Box>
            <Box display="flex" flexDirection="column" justifyContent="center">
              <IconButton
                onClick={() => {
                  if (loan.status === RequestStatusEnum.Drafted) {
                    deleteFinancingRequestFromState();
                    return;
                  }
                  const newDeleteExistingFinancingRequestIds = new Set(
                    deleteExistingFianancingRequestsIds
                  );
                  newDeleteExistingFinancingRequestIds.add(loan.id);
                  setDeleteExistingFinancingRequestIds(
                    newDeleteExistingFinancingRequestIds
                  );
                }}
              >
                <TrashIcon />
              </IconButton>
              <Box mb={4} />
              <IconButton
                onClick={() => {
                  setCurrentlyEditingLoan(loan);
                  handleClickAddFinancingRequest();
                  handleClickRemoveNewFinancingRequest();
                }}
              >
                <EditIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </StyledCardContent>
    </FinancingRequestCard>
  );
}
