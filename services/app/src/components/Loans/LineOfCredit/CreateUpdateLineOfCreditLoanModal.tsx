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
  useAddLineOfCreditAndLoanMutation,
  useApprovedVendorsByPartnerCompanyIdQuery,
  useLoanForCustomerQuery,
  useLoanSiblingsQuery,
  useUpdateLineOfCreditAndLoanMutation,
} from "generated/graphql";
import { ActionType } from "lib/ActionType";
import { authenticatedApi, loansRoutes } from "lib/api";
import { isNull, mergeWith } from "lodash";
import { useContext, useState } from "react";
import LineOfCreditLoanForm from "./LineOfCreditLoanForm";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 500,
    },
    dialogTitle: {
      paddingLeft: theme.spacing(4),
      borderBottom: "1px solid #c7c7c7",
    },
    purchaseOrderInput: {
      width: 400,
    },
    dialogActions: {
      margin: theme.spacing(4),
      marginTop: 0,
      marginBottom: 15,
    },
    submitButton: {
      marginLeft: theme.spacing(1),
    },
  })
);

function fifteenDaysAfterDate(date: Date) {
  const resultDate = new Date(date);
  resultDate.setDate(resultDate.getDate() + 15);
  return resultDate;
}

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
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  const newLineOfCredit: LineOfCreditsInsertInput = {
    company_id: companyId,
    is_credit_for_vendor: false,
    recipient_vendor_id: "",
  };

  // Default Loan for CREATE case.
  const newLoan: LoansInsertInput = {
    company_id: companyId,
    loan_type: LoanTypeEnum.LineOfCredit,
    origination_date: null,
    maturity_date: null,
    adjusted_maturity_date: null,
    amount: "",
    status: LoanStatusEnum.Drafted,
  };

  const [lineOfCredit, setLineOfCredit] = useState(newLineOfCredit);
  const [loan, setLoan] = useState(newLoan);

  const { loading: isExistingLoanLoading } = useLoanForCustomerQuery({
    variables: {
      id: loanId,
    },
    onCompleted: (data) => {
      const existingLoan = data.loans_by_pk;
      if (actionType === ActionType.Update && existingLoan) {
        setLoan(
          mergeWith(newLoan, existingLoan, (a, b) => (isNull(b) ? a : b))
        );
      }
    },
  });

  const {
    data: loanSiblingsData,
    loading: isLoanSiblingsLoading,
  } = useLoanSiblingsQuery({
    fetchPolicy: "network-only",
    variables: {
      // The `|| null` below is necessary because "" is an invalid parameter to give to the query.
      // `null` is given in the case of a new loan.
      loanId: loanId || null,
      loanType: LoanTypeEnum.LineOfCredit,
      artifactId: loan.artifact_id,
    },
  });

  console.log({ loanSiblingsData });
  // const loanSiblings = loanSiblingsData?.loans || [];
  // const siblingsTotalAmount = loanSiblings
  //   .filter((loanSibling) =>
  //     [LoanStatusEnum.ApprovalRequested, LoanStatusEnum.Approved].includes(
  //       loanSibling.status
  //     )
  //   )
  //   .reduce((sum, loanSibling) => sum + loanSibling.amount || 0, 0);

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
    addLineOfCreditAndLoan,
    { loading: isAddLineOfCreditAndLoanLoading },
  ] = useAddLineOfCreditAndLoanMutation();

  const [
    updateLineOfCreditAndLoan,
    { loading: isUpdateLineOfCreditAndLoanLoading },
  ] = useUpdateLineOfCreditAndLoanMutation();

  // const proposedLoansTotalAmount =
  //   siblingsTotalAmount + parseFloat(loan?.amount) || 0;

  const isDialogReady = !isExistingLoanLoading && !isApprovedVendorsLoading;
  const isFormValid = !!loan.amount;
  const isFormLoading =
    isAddLineOfCreditAndLoanLoading || isUpdateLineOfCreditAndLoanLoading;
  const isSaveDraftDisabled = !isFormValid || isFormLoading;

  // TODO(warren): Make it apparent to the user the reason we are disabling submitting a purchase order
  // for approval, e.g., if they are asking for more than the purchase order is worth.
  const isSaveSubmitDisabled =
    !isFormValid ||
    isFormLoading ||
    isLoanSiblingsLoading ||
    // proposedLoansTotalAmount > selectedPurchaseOrder.amount ||
    !loan?.origination_date ||
    !loan?.amount;

  const upsertLineOfCreditLoan = async () => {
    // TODO (warrenshen): in the future, maturity date will
    // be set server-side or by bank users, not by customer users.
    const fifteenDaysFromNow = new Date(
      new Date().getTime() + 15 * 24 * 60 * 60 * 1000
    );
    const maturityDate = loan.origination_date
      ? fifteenDaysAfterDate(new Date(loan.origination_date))
      : fifteenDaysFromNow;

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
            origination_date: loan.origination_date || null,
            amount: loan.amount || null,
            maturity_date: maturityDate,
            adjusted_maturity_date: maturityDate,
          },
        },
      });
      return response.data?.update_line_of_credits_by_pk;
    } else {
      const response = await addLineOfCreditAndLoan({
        variables: {
          lineOfCredit: {
            is_credit_for_vendor: lineOfCredit.is_credit_for_vendor,
            recipient_vendor_id: lineOfCredit.recipient_vendor_id,
          },
          loan: {
            loan_type: loan.loan_type,
            origination_date: loan.origination_date,
            maturity_date: loan.maturity_date,
            adjusted_maturity_date: loan.adjusted_maturity_date,
            amount: loan.amount,
          },
        },
      });
      return response.data?.insert_line_of_credits_one;
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
    const savedLineOfCredit = await upsertLineOfCreditLoan();
    if (!savedLineOfCredit) {
      alert("Could not upsert loan");
    } else {
      // Since this is a SAVE AND SUBMIT action,
      // hit the PurchaseOrderLoans.SubmitForApproval endpoint.
      const response = await authenticatedApi.post(
        loansRoutes.submitForApproval,
        {
          loan_id: savedLineOfCredit.id,
        }
      );
      if (response.data?.status === "ERROR") {
        alert(response.data?.msg);
      }
    }
    handleClose();
  };

  return isDialogReady ? (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="xl"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle className={classes.dialogTitle}>
        {`${actionType === ActionType.Update ? "Edit" : "Create"} Drawdown`}
      </DialogTitle>
      <DialogContent>
        <LineOfCreditLoanForm
          lineOfCredit={lineOfCredit}
          loan={loan}
          selectableVendors={selectableVendors}
          setLineOfCredit={setLineOfCredit}
          setLoan={setLoan}
        ></LineOfCreditLoanForm>
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
