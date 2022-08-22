import { Box, Card, CardContent, Divider } from "@material-ui/core";
import ModalIconButton from "components/Shared/Modal/ModalIconButton";
import { LoansInsertInput, RequestStatusEnum } from "generated/graphql";
import { EditIcon, TrashIcon } from "icons/index";
import { formatDateString } from "lib/date";
import { formatCurrency } from "lib/number";
import styled from "styled-components";

import DeleteFinancingRequestModal from "./DeleteFinancingRequestModal";
import EditFinancingRequestPurchaseOrderModal from "./EditFinancialRequestPurchaseOrderModal";

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

const NewStatusChipPlaceholder = styled.div`
  background-color: #f6f5f3;
  width: 160px;
  height: 32px;
`;

const StyledCardContent = styled(CardContent)`
  padding-right: 8px;
`;

interface Props {
  loan: LoansInsertInput;
  setLoan: (loan: LoansInsertInput) => void;
  purchaseOrderId: string;
  requestedPaymentDate: string;
  financingAmount: number;
  status: RequestStatusEnum;
}

export default function FinancingRequestViewCard({
  purchaseOrderId,
  requestedPaymentDate,
  financingAmount,
  status,
}: Props) {
  return (
    <FinancingRequestCard>
      <StyledCardContent>
        <Box display="flex" justifyContent="space-between">
          <Box display="flex" flexDirection="column">
            <Label>Requested Payment Date</Label>
            <Value>{formatDateString(requestedPaymentDate)}</Value>
            <Box m={2} />
            <Label>Requested Payment Date</Label>
            <Value>{formatCurrency(financingAmount)}</Value>
          </Box>
          <Box display="flex" flexDirection="column" justifyContent="center">
            <NewStatusChipPlaceholder>{status}</NewStatusChipPlaceholder>
          </Box>
          <Box display="flex">
            <Box>
              <Divider orientation="vertical" />
            </Box>
            <Box display="flex" flexDirection="column" justifyContent="center">
              <ModalIconButton
                modal={({ handleClose }) => (
                  <DeleteFinancingRequestModal
                    loanId={"hello"}
                    companyName={"Inventory Financing Company"}
                    poNumber={"0x00AQFE-119"}
                    disbursementId={"DN-132149801"}
                    requestedAmount={975000}
                    handleClose={() => {
                      handleClose();
                    }}
                  />
                )}
              >
                <TrashIcon />
              </ModalIconButton>

              <Box mb={4} />
              <ModalIconButton
                modal={({ handleClose }) => (
                  <EditFinancingRequestPurchaseOrderModal
                    purchaseOrderId={purchaseOrderId}
                    handleClose={() => {
                      handleClose();
                    }}
                  />
                )}
              >
                <EditIcon />
              </ModalIconButton>
            </Box>
          </Box>
        </Box>
      </StyledCardContent>
    </FinancingRequestCard>
  );
}
