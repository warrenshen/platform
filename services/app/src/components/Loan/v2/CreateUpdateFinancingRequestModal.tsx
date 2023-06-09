import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import LineOfCreditLoanFormNew from "components/Loan/v2/LineOfCreditLoanFormNew";
import Modal from "components/Shared/Modal/Modal";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  Companies,
  LineOfCreditsInsertInput,
  LoanTypeEnum,
  LoansInsertInput,
  Scalars,
  useAddLineOfCreditMutation,
  useAddLoanMutation,
  useGetArtifactRelationsByCompanyIdQuery,
  useGetCompanyNextLoanIdentifierMutation,
  useGetLoanWithArtifactForCustomerQuery,
  useUpdateLineOfCreditAndLoanMutation,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { submitLoCLoanMutation } from "lib/api/loans";
import { ActionType, LoanStatusEnum, PlatformModeEnum } from "lib/enum";
import { isNull, mergeWith } from "lodash";
import { useContext, useState } from "react";

interface Props {
  actionType: ActionType;
  companyId: Companies["id"];
  loanId: Scalars["uuid"] | null;
  adjustedTotalLimit: number;
  availableLimit: number;
  handleClose: () => void;
}

const CreateUpdateFinancingRequestModal = ({
  actionType,
  companyId,
  loanId = null,
  adjustedTotalLimit,
  availableLimit,
  handleClose,
}: Props) => {
  const snackbar = useSnackbar();

  const {
    user: { platformMode },
  } = useContext(CurrentUserContext);
  const isBankUser = platformMode === PlatformModeEnum.Bank;

  const newLineOfCredit: LineOfCreditsInsertInput = {
    company_id: companyId,
    recipient_vendor_id: null,
    is_credit_for_vendor: false,
    customer_note: null,
  };

  // Default Loan for CREATE case.
  const newLoan: LoansInsertInput = {
    company_id: companyId,
    loan_type: LoanTypeEnum.LineOfCredit,
    requested_payment_date: null,
    amount: null,
    status: LoanStatusEnum.Drafted,
  };

  const [lineOfCredit, setLineOfCredit] = useState(newLineOfCredit);
  const [loan, setLoan] = useState(newLoan);

  const { loading: isExistingLoanLoading } =
    useGetLoanWithArtifactForCustomerQuery({
      skip: actionType === ActionType.New,
      fetchPolicy: "network-only",
      variables: {
        id: loanId,
      },
      onCompleted: (data) => {
        const existingLoan = data.loans_by_pk;
        if (actionType === ActionType.Update && existingLoan) {
          setLoan(
            mergeWith(newLoan, existingLoan, (a, b) => (isNull(b) ? a : b))
          );
          const existingLineOfCredit = existingLoan.line_of_credit;
          if (existingLineOfCredit) {
            setLineOfCredit(
              mergeWith(lineOfCredit, existingLineOfCredit, (a, b) =>
                isNull(b) ? a : b
              )
            );
          }
        }
      },
    });

  const { data, loading: isApprovedVendorsLoading } =
    useGetArtifactRelationsByCompanyIdQuery({
      fetchPolicy: "network-only",
      variables: {
        company_id: companyId,
      },
    });
  const vendors = data?.vendors || [];

  const [addLineOfCredit, { loading: isAddLineOfCreditLoading }] =
    useAddLineOfCreditMutation();

  const [addLoan, { loading: isAddLoanLoading }] = useAddLoanMutation();

  const [
    updateLineOfCreditAndLoan,
    { loading: isUpdateLineOfCreditAndLoanLoading },
  ] = useUpdateLineOfCreditAndLoanMutation();

  const [submitLoan, { loading: isSubmitLoanLoading }] = useCustomMutation(
    submitLoCLoanMutation
  );

  const [getCompanyNextLoanIdentifier] =
    useGetCompanyNextLoanIdentifierMutation();

  const getNextLoanIdentifierByCompanyId = async () => {
    const response = await getCompanyNextLoanIdentifier({
      variables: {
        companyId,
        increment: { latest_loan_identifier: 1 },
      },
    });
    return response.data?.update_companies_by_pk?.latest_loan_identifier;
  };

  const upsertLineOfCreditLoan = async () => {
    if (loan.id) {
      const response = await updateLineOfCreditAndLoan({
        variables: {
          lineOfCreditId: lineOfCredit.id,
          lineOfCredit: {
            recipient_vendor_id: lineOfCredit.recipient_vendor_id,
            is_credit_for_vendor: lineOfCredit.is_credit_for_vendor,
            customer_note: lineOfCredit.customer_note,
          },
          loanId: loan.id,
          loan: {
            requested_payment_date: loan.requested_payment_date || null,
            amount: loan.amount || null,
          },
        },
      });
      return response.data?.update_loans_by_pk;
    } else {
      const nextLoanIdentifier = await getNextLoanIdentifierByCompanyId();
      if (!nextLoanIdentifier) {
        snackbar.showError("Error! Something went wrong.");
      } else {
        const responseLineOfCredit = await addLineOfCredit({
          variables: {
            lineOfCredit: {
              company_id: isBankUser ? companyId : undefined,
              recipient_vendor_id: lineOfCredit.recipient_vendor_id,
              is_credit_for_vendor: lineOfCredit.is_credit_for_vendor,
              customer_note: lineOfCredit.customer_note,
            },
          },
        });
        const artifactId =
          responseLineOfCredit.data?.insert_line_of_credits_one?.id;
        if (!artifactId) {
          alert("Could not add line of credit");
          snackbar.showError("Error! Something went wrong.");
        } else {
          const responseLoan = await addLoan({
            variables: {
              loan: {
                company_id: isBankUser ? companyId : undefined,
                identifier: nextLoanIdentifier.toString(),
                artifact_id: artifactId,
                loan_type: loan.loan_type,
                requested_payment_date: loan.requested_payment_date,
                amount: loan.amount,
              },
            },
          });
          return responseLoan.data?.insert_loans_one;
        }
      }
    }
  };

  const handleClickSaveSubmit = async () => {
    const savedLoan = await upsertLineOfCreditLoan();
    if (!savedLoan) {
      alert("Could not upsert loan");
    } else {
      // Since this is a SAVE AND SUBMIT action,
      // hit the PurchaseOrderLoans.SubmitForApproval endpoint.

      // Make sure to save the loan ID so we remember that this loan already exists
      // in the DB.
      setLoan({
        ...loan,
        id: savedLoan.id,
      });

      const response = await submitLoan({
        variables: {
          loan_id: savedLoan.id,
        },
      });
      if (response.status !== "OK") {
        snackbar.showError(
          `Error! Could not submit loan. Reason: ${response.msg}`
        );
        snackbar.showError(response.msg);
      } else {
        snackbar.showSuccess(
          "Loan saved and submitted to Bespoke. You may view this advance request in the Loans section."
        );
        handleClose();
      }
    }
  };

  const isDialogReady = !isExistingLoanLoading && !isApprovedVendorsLoading;
  const isFormValid = !!loan.amount;
  const isFormLoading =
    isAddLineOfCreditLoading ||
    isAddLoanLoading ||
    isUpdateLineOfCreditAndLoanLoading ||
    isSubmitLoanLoading;
  const isSaveDraftDisabled = !isFormValid || isFormLoading;

  const isRecipientVendorNotApproved =
    lineOfCredit.is_credit_for_vendor &&
    !vendors?.find((vendor) => vendor.id === lineOfCredit.recipient_vendor_id)
      ?.company_vendor_partnerships[0].approved_at;
  const isSaveSubmitDisabled =
    isSaveDraftDisabled ||
    isRecipientVendorNotApproved ||
    !loan?.requested_payment_date ||
    !loan?.amount;

  return isDialogReady ? (
    <Modal
      isPrimaryActionDisabled={isSaveSubmitDisabled}
      isSecondaryActionDisabled={isSaveDraftDisabled}
      title={
        actionType === ActionType.Update
          ? "Edit Financing Request"
          : "Request Financing"
      }
      primaryActionText={"Save & Submit"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickSaveSubmit}
      contentWidth={600}
    >
      <>
        {isBankUser && (
          <Box mt={2} mb={6}>
            <Alert severity="warning">
              <Typography variant="body1">
                {`Warning: you are ${
                  actionType === ActionType.Update
                    ? "editing a financing request"
                    : "requesting financing"
                } on behalf of this customer (only bank admins can do this).`}
              </Typography>
            </Alert>
          </Box>
        )}
        <LineOfCreditLoanFormNew
          lineOfCredit={lineOfCredit}
          loan={loan}
          vendors={vendors}
          adjustedTotalLimit={adjustedTotalLimit}
          availableLimit={availableLimit}
          setLineOfCredit={setLineOfCredit}
          setLoan={setLoan}
        />
      </>
    </Modal>
  ) : null;
};

export default CreateUpdateFinancingRequestModal;
