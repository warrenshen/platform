import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
  Theme,
} from "@material-ui/core";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  LineOfCreditsInsertInput,
  LoansInsertInput,
  LoanStatusEnum,
  LoanTypeEnum,
  Scalars,
  useAddLineOfCreditMutation,
  useAddLoanMutation,
  useApprovedVendorsByPartnerCompanyIdQuery,
  useGetCompanyNextLoanIdentifierMutation,
  useGetLoanWithArtifactForCustomerQuery,
  useUpdateLineOfCreditAndLoanMutation,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import { authenticatedApi, loansRoutes } from "lib/api";
import { ActionType } from "lib/enum";
import { isNull, mergeWith } from "lodash";
import { useContext, useState } from "react";
import LineOfCreditLoanForm from "./LineOfCreditLoanForm";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 500,
    },
    dialogTitle: {
      borderBottom: "1px solid #c7c7c7",
    },
    purchaseOrderInput: {
      width: 400,
    },
    dialogActions: {
      margin: theme.spacing(2),
    },
    submitButton: {
      marginLeft: theme.spacing(1),
    },
  })
);

interface Props {
  actionType: ActionType;
  loanId: Scalars["uuid"] | null;
  handleClose: () => void;
}

function CreateUpdateLineOfCreditLoanModal({
  actionType,
  loanId = null,
  handleClose,
}: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  const newLineOfCredit: LineOfCreditsInsertInput = {
    company_id: companyId,
    is_credit_for_vendor: false,
    recipient_vendor_id: null,
  };

  // Default Loan for CREATE case.
  const newLoan: LoansInsertInput = {
    company_id: companyId,
    loan_type: LoanTypeEnum.LineOfCredit,
    requested_payment_date: null,
    maturity_date: null,
    adjusted_maturity_date: null,
    amount: "",
    status: LoanStatusEnum.Drafted,
  };

  const [lineOfCredit, setLineOfCredit] = useState(newLineOfCredit);
  const [loan, setLoan] = useState(newLoan);

  const {
    loading: isExistingLoanLoading,
  } = useGetLoanWithArtifactForCustomerQuery({
    skip: actionType === ActionType.New,
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

  const {
    data,
    loading: isApprovedVendorsLoading,
  } = useApprovedVendorsByPartnerCompanyIdQuery({
    fetchPolicy: "network-only",
    variables: {
      companyId,
    },
  });
  const selectableVendors = data?.vendors || [];

  const [
    addLineOfCredit,
    { loading: isAddLineOfCreditLoading },
  ] = useAddLineOfCreditMutation();

  const [addLoan, { loading: isAddLoanLoading }] = useAddLoanMutation();

  const [
    updateLineOfCreditAndLoan,
    { loading: isUpdateLineOfCreditAndLoanLoading },
  ] = useUpdateLineOfCreditAndLoanMutation();

  const [
    getCompanyNextLoanIdentifier,
  ] = useGetCompanyNextLoanIdentifierMutation();

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
    if (actionType === ActionType.Update) {
      const response = await updateLineOfCreditAndLoan({
        variables: {
          lineOfCreditId: lineOfCredit.id,
          lineOfCredit: {
            is_credit_for_vendor: lineOfCredit.is_credit_for_vendor,
            recipient_vendor_id: lineOfCredit.recipient_vendor_id,
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
              is_credit_for_vendor: lineOfCredit.is_credit_for_vendor,
              recipient_vendor_id: lineOfCredit.recipient_vendor_id,
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

  const handleClickSaveDraft = async () => {
    const savedLineOfCredit = await upsertLineOfCreditLoan();
    if (!savedLineOfCredit) {
      alert("Could not upsert loan");
    }
    handleClose();
  };

  const handleClickSaveSubmit = async () => {
    const savedLoan = await upsertLineOfCreditLoan();
    if (!savedLoan) {
      alert("Could not upsert loan");
    } else {
      // Since this is a SAVE AND SUBMIT action,
      // hit the PurchaseOrderLoans.SubmitForApproval endpoint.
      const response = await authenticatedApi.post(
        loansRoutes.submitForApproval,
        {
          loan_id: savedLoan.id,
        }
      );
      if (response.data?.status === "ERROR") {
        alert(response.data?.msg);
      }
    }
    handleClose();
  };

  const isDialogReady = !isExistingLoanLoading && !isApprovedVendorsLoading;
  const isFormValid = !!loan.amount;
  const isFormLoading =
    isAddLineOfCreditLoading ||
    isAddLoanLoading ||
    isUpdateLineOfCreditAndLoanLoading;
  const isSaveDraftDisabled = !isFormValid || isFormLoading;

  const isSaveSubmitDisabled =
    !isFormValid ||
    isFormLoading ||
    !loan?.requested_payment_date ||
    !loan?.amount;

  return isDialogReady ? (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="xl"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle className={classes.dialogTitle}>
        {`${actionType === ActionType.Update ? "Edit" : "Create"} Loan`}
      </DialogTitle>
      <DialogContent>
        <LineOfCreditLoanForm
          lineOfCredit={lineOfCredit}
          loan={loan}
          selectableVendors={selectableVendors}
          setLineOfCredit={setLineOfCredit}
          setLoan={setLoan}
        />
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Box>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            disabled={isSaveDraftDisabled}
            onClick={handleClickSaveDraft}
            variant={"contained"}
            color={"secondary"}
          >
            Save as Draft
          </Button>
          <Button
            className={classes.submitButton}
            disabled={isSaveSubmitDisabled}
            onClick={handleClickSaveSubmit}
            variant="contained"
            color="primary"
          >
            Save and Submit
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  ) : null;
}

export default CreateUpdateLineOfCreditLoanModal;
