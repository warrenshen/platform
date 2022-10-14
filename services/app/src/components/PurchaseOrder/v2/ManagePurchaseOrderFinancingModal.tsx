import { Box, Button, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import {
  SecondaryTextColor,
  WarningDefaultColor,
} from "components/Shared/Colors/GlobalColors";
import Modal from "components/Shared/Modal/Modal";
import ProgressBar from "components/Shared/ProgressBar/ProgressBar";
import {
  Companies,
  LoanLimitedFragment,
  LoanTypeEnum,
  LoansInsertInput,
  PurchaseOrders,
  RequestStatusEnum,
  useGetLoansByArtifactIdQuery,
  useGetPurchaseOrderForCustomerQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { CheckIcon, CloseIcon, PlusIcon } from "icons";
import { submitLoanMutationNew } from "lib/api/loans";
import { LoanStatusEnum } from "lib/enum";
import { isPurchaseOrderDueDateValid } from "lib/purchaseOrders";
import { partition } from "lodash";
import { useState } from "react";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";

import PurchaseOrderPreviewCard from "../PurchaseOrderPreviewCard";
import FinancingRequestCreateCard from "./FinancingRequestCreateCard";
import FinancingRequestViewCard from "./FinancingRequestViewCard";
import FloatingIconActionButton from "./FloatingIconActionButton";
import FundedLoansViewCard from "./FundedLoansViewCard";

const StyledAlert = styled(Alert)`
  justify-content: center;
  align-items: center;
  height: 72px;
`;

const StyledButton = styled(Button)<{ $color: string }>`
  width: 100%;
  height: 48px;
  color: ${({ $color }) => $color};
  border: 2px solid ${({ $color }) => $color};
`;

// TODO: System for styling svgs
const StyledCloseIcon = styled(CloseIcon)``;

const mapFinancingRequestToLoanInsertInput = (
  loan: LoanLimitedFragment,
  purchaseOrderId: string
) => {
  return {
    id: loan.id,
    artifact_id: purchaseOrderId,
    loan_type: LoanTypeEnum.PurchaseOrder,
    requested_payment_date: loan.requested_payment_date,
    amount: loan.amount,
    status: loan.status,
    customer_notes: loan.customer_notes || "",
  };
};

const canSaveFinancingRequest = (
  loan: LoansInsertInput,
  amountRemaining: number
) => {
  return (
    loan.requested_payment_date && loan.amount && loan.amount <= amountRemaining
  );
};

interface Props {
  companyId: Companies["id"];
  purchaseOrderId: PurchaseOrders["id"];
  handleClose: () => void;
}

// FINANCING REQUEST = LOAN
function ManagePurchaseOrderFinancingModal({
  companyId,
  purchaseOrderId,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  const { data, loading: isExistingPurchaseOrderLoading } =
    useGetPurchaseOrderForCustomerQuery({
      fetchPolicy: "network-only",
      variables: {
        id: purchaseOrderId,
      },
    });

  const purchaseOrder = data?.purchase_orders_by_pk || null;

  const defaultLoan: LoansInsertInput = {
    artifact_id: purchaseOrderId,
    company_id: companyId,
    id: null,
    loan_type: LoanTypeEnum.PurchaseOrder,
    requested_payment_date: null,
    amount: null,
    status: LoanStatusEnum.Drafted,
    customer_notes: "",
  };

  const [hasEdited, setHasEdited] = useState<boolean>(false);
  const [currentlyEditingLoan, setCurrentlyEditingLoan] =
    useState<LoansInsertInput>(defaultLoan);
  const [newLoan, setNewLoan] = useState<LoansInsertInput>(defaultLoan);
  const [isNewLoanShown, setIsNewLoanShown] = useState<boolean>(true);
  const [financingRequests, setFinancingRequests] = useState<
    LoansInsertInput[]
  >([]);
  const [fundedLoans, setFundedLoans] = useState<LoansInsertInput[]>([]);
  const [
    deleteExistingFinancingRequestIds,
    setDeleteExistingFinancingRequestIds,
  ] = useState<Set<string>>(new Set());

  useGetLoansByArtifactIdQuery({
    skip: !purchaseOrder,
    fetchPolicy: "network-only",
    variables: {
      artifact_id: purchaseOrder?.id,
    },
    onCompleted: (data) => {
      const [fundedLoans, notFundedLoans] = partition(
        data.loans,
        (loan) => loan.funded_at !== null
      );
      setFinancingRequests(
        notFundedLoans.map((loan) =>
          mapFinancingRequestToLoanInsertInput(loan, purchaseOrderId)
        )
      );
      setFundedLoans(
        fundedLoans.map((loan) =>
          mapFinancingRequestToLoanInsertInput(loan, purchaseOrderId)
        )
      );
      if (data.loans.length > 0) {
        setIsNewLoanShown(false);
      }
    },
  });

  const [submitLoanNew, { loading: isSubmitLoanNewLoading }] =
    useCustomMutation(submitLoanMutationNew);

  if (isExistingPurchaseOrderLoading || !purchaseOrder) {
    return null;
  }

  const handleClickAddFinancingRequest = () => {
    if (canCreateNewFinancingRequest) {
      setFinancingRequests([
        ...financingRequests,
        {
          ...newLoan,
          id: uuidv4(),
          status: RequestStatusEnum.Drafted,
        },
      ]);
    }
    setNewLoan(defaultLoan);
    setIsNewLoanShown(true);
  };

  const handleClickRemoveNewFinancingRequest = () => {
    setIsNewLoanShown(false);
  };

  const handleClickSubmit = async () => {
    const create_or_update_loans = [...financingRequests]
      .filter((loan) => !deleteExistingFinancingRequestIds.has(loan.id))
      .filter((loan) => loan.status !== RequestStatusEnum.Approved)
      .map((loan) => ({
        amount: loan.amount,
        artifact_id: loan.artifact_id,
        company_id: companyId,
        loan_id: loan.status === RequestStatusEnum.Drafted ? null : loan.id,
        loan_type: loan.loan_type,
        requested_payment_date: loan.requested_payment_date,
        customer_notes: loan.customer_notes,
      }));
    if (canCreateNewFinancingRequest) {
      create_or_update_loans.push({
        amount: newLoan.amount,
        artifact_id: newLoan.artifact_id,
        company_id: companyId,
        loan_id: null,
        loan_type: newLoan.loan_type,
        requested_payment_date: newLoan.requested_payment_date,
        customer_notes: newLoan.customer_notes,
      });
    }
    const response = await submitLoanNew({
      variables: {
        create_or_update_loans,
        delete_loan_ids: Array.from(deleteExistingFinancingRequestIds),
      },
    });
    if (response.status === "ERROR") {
      snackbar.showError(response.msg);
    } else {
      snackbar.showSuccess("Successfully submitted request for financing");
      handleClose();
    }
  };

  const { isDueDateValid } = isPurchaseOrderDueDateValid(
    purchaseOrder.order_date,
    purchaseOrder.net_terms
  );

  const amountRemaining = purchaseOrder.amount - purchaseOrder.amount_funded;
  const currentlyEditingLoanAmount =
    currentlyEditingLoan?.amount || newLoan?.amount || 0;
  const proposedLoansTotalAmount =
    financingRequests
      .filter(
        (financingRequest) => financingRequest.id !== currentlyEditingLoan?.id
      )
      .reduce((amountRequested, financingRequest) => {
        return amountRequested + financingRequest.amount;
      }, 0) + currentlyEditingLoanAmount;

  const isSaveSubmitDisabled = proposedLoansTotalAmount > amountRemaining;

  const canCreateNewFinancingRequest =
    isDueDateValid &&
    newLoan.amount &&
    newLoan.requested_payment_date &&
    proposedLoansTotalAmount <= amountRemaining;

  const isPrimaryActionDisabled =
    isSubmitLoanNewLoading ||
    isSaveSubmitDisabled ||
    (!canCreateNewFinancingRequest && isNewLoanShown) ||
    !!currentlyEditingLoan.id;

  return (
    <Modal
      title={"Manage Purchase Order Financing"}
      dataCy={"create-financing-requests-modal"}
      primaryActionText={"Save & Submit"}
      isPrimaryActionDisabled={isPrimaryActionDisabled}
      handlePrimaryAction={handleClickSubmit}
      handleClose={handleClose}
      contentWidth={600}
    >
      <Box>
        {purchaseOrder && (
          <PurchaseOrderPreviewCard purchaseOrder={purchaseOrder} width={600} />
        )}
        <Box mt={4} mb={4}>
          <ProgressBar
            amountFunded={
              purchaseOrder.amount_funded + proposedLoansTotalAmount <=
              purchaseOrder.amount
                ? purchaseOrder.amount_funded + proposedLoansTotalAmount
                : purchaseOrder.amount
            }
            totalAmount={purchaseOrder.amount}
          />
        </Box>
        <Typography variant="subtitle1">Request Financing</Typography>
        <Box mt={2}>
          {fundedLoans.map((loan) => (
            <Box mb={2}>
              <FundedLoansViewCard loan={loan} status={LoanStatusEnum.Funded} />
            </Box>
          ))}
          {financingRequests
            .filter(
              (financingRequest) =>
                !deleteExistingFinancingRequestIds.has(financingRequest.id)
            )
            .map((financingRequest) =>
              financingRequest.id === currentlyEditingLoan.id ? (
                <Box
                  display="flex"
                  flexDirection="row"
                  alignItems="center"
                  mb={2}
                  width={672}
                  overflow="auto"
                >
                  <FinancingRequestCreateCard
                    key={financingRequest.id}
                    loan={financingRequest}
                    hasBeenFocused={false}
                    amountLeft={
                      amountRemaining -
                      (proposedLoansTotalAmount - financingRequest.amount)
                    }
                    hasEdited={hasEdited}
                    setLoan={setCurrentlyEditingLoan}
                    setHasEdited={setHasEdited}
                  />
                  <Box ml={3}>
                    <FloatingIconActionButton
                      variant="filled"
                      disabled={
                        !canSaveFinancingRequest(
                          currentlyEditingLoan,
                          amountRemaining + proposedLoansTotalAmount
                        )
                      }
                      handleClick={() => {
                        setFinancingRequests(
                          financingRequests.map((financingRequest) =>
                            financingRequest.id === currentlyEditingLoan.id
                              ? currentlyEditingLoan
                              : financingRequest
                          )
                        );
                        setCurrentlyEditingLoan(defaultLoan);
                      }}
                    >
                      <CheckIcon />
                    </FloatingIconActionButton>
                  </Box>
                </Box>
              ) : (
                <Box mb={2}>
                  <FinancingRequestViewCard
                    key={financingRequest.id}
                    loan={financingRequest}
                    status={financingRequest.status as LoanStatusEnum}
                    comments={financingRequest.customer_notes}
                    setCurrentlyEditingLoan={setCurrentlyEditingLoan}
                    deleteFinancingRequestFromState={() =>
                      setFinancingRequests(
                        financingRequests.filter(
                          (request) => request.id !== financingRequest.id
                        )
                      )
                    }
                    deleteExistingFianancingRequestsIds={
                      deleteExistingFinancingRequestIds
                    }
                    setDeleteExistingFinancingRequestIds={
                      setDeleteExistingFinancingRequestIds
                    }
                    handleClickAddFinancingRequest={
                      handleClickAddFinancingRequest
                    }
                    handleClickRemoveNewFinancingRequest={
                      handleClickRemoveNewFinancingRequest
                    }
                  />
                </Box>
              )
            )}
        </Box>
        {!currentlyEditingLoan.id && isNewLoanShown && (
          <Box mt={2}>
            <FinancingRequestCreateCard
              key={currentlyEditingLoan.id}
              loan={newLoan}
              hasBeenFocused={false}
              amountLeft={amountRemaining}
              hasEdited={hasEdited}
              setLoan={setNewLoan}
              setHasEdited={setHasEdited}
            />
          </Box>
        )}
        {(canCreateNewFinancingRequest || !isNewLoanShown) &&
          !currentlyEditingLoan.id && (
            <Box display="flex" justifyContent="center" mt={3}>
              <StyledButton
                variant="outlined"
                startIcon={<PlusIcon />}
                $color={SecondaryTextColor}
                onClick={handleClickAddFinancingRequest}
              >
                Add Financing Request
              </StyledButton>
            </Box>
          )}
        {isNewLoanShown &&
          !canCreateNewFinancingRequest &&
          financingRequests.length > 0 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <StyledButton
                variant="outlined"
                startIcon={<StyledCloseIcon fillColor={WarningDefaultColor} />}
                $color="#e75d5d"
                onClick={handleClickRemoveNewFinancingRequest}
              >
                Remove Financing Request
              </StyledButton>
            </Box>
          )}
      </Box>
      {hasEdited && (
        <Box
          mt={2}
          overflow="auto"
          width="100vw"
          position="absolute"
          bottom={84}
          left="50%"
          right="50%"
          ml="-50vw"
          mr="-50vw"
          justifyContent="center"
          alignItems="center"
        >
          <StyledAlert severity="warning" style={{ justifyContent: "center" }}>
            <Typography variant="body1">
              Important: you have unsaved changes. Please press "Save and
              Submit" below to save your changes. If you want to cancel your
              changes, you may close this window.
            </Typography>
          </StyledAlert>
        </Box>
      )}
    </Modal>
  );
}

export default ManagePurchaseOrderFinancingModal;
