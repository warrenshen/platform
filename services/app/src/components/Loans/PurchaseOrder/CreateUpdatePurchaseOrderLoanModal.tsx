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
import {
  LoansInsertInput,
  LoanStatusEnum,
  LoanTypeEnum,
  Scalars,
  useAddLoanMutation,
  useApprovedPurchaseOrdersQuery,
  useLoanForCustomerQuery,
  useLoanSiblingsQuery,
  useUpdateLoanMutation,
} from "generated/graphql";
import { ActionType } from "lib/ActionType";
import { authenticatedApi, loansRoutes } from "lib/api";
import { isNull, mergeWith } from "lodash";
import { useState } from "react";
import PurchaseOrderLoanForm from "./PurchaseOrderLoanForm";

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

function CreateUpdatePurchaseOrderLoanModal({
  actionType,
  loanId = null,
  handleClose,
}: Props) {
  const classes = useStyles();

  // Default Loan for CREATE case.
  const newLoan: LoansInsertInput = {
    artifact_id: "",
    loan_type: LoanTypeEnum.PurchaseOrder,
    origination_date: null,
    maturity_date: null,
    adjusted_maturity_date: null,
    amount: "",
    status: LoanStatusEnum.Drafted,
  };

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
      loanType: LoanTypeEnum.PurchaseOrder,
      artifactId: loan.artifact_id,
    },
  });

  const loanSiblings = loanSiblingsData?.loans || [];
  const siblingsTotalAmount = loanSiblings
    .filter((loanSibling) =>
      [LoanStatusEnum.ApprovalRequested, LoanStatusEnum.Approved].includes(
        loanSibling.status
      )
    )
    .reduce((sum, loanSibling) => sum + loanSibling.amount || 0, 0);

  const [addLoan, { loading: isAddLoanLoading }] = useAddLoanMutation();

  const [
    updateLoan,
    { loading: isUpdateLoanLoading },
  ] = useUpdateLoanMutation();

  // TODO (warrenshen): should this query have a companyId variable?
  const {
    data,
    loading: isApprovedPurchaseOrdersLoading,
  } = useApprovedPurchaseOrdersQuery({
    fetchPolicy: "network-only",
  });

  const proposedLoansTotalAmount =
    siblingsTotalAmount + parseFloat(loan?.amount) || 0;

  const approvedPurchaseOrders = data?.purchase_orders || [];

  const selectedPurchaseOrder = approvedPurchaseOrders.find(
    (purchaseOrder) => purchaseOrder.id === loan.artifact_id
  );

  const upsertPurchaseOrderLoan = async () => {
    // TODO (warrenshen): in the future, maturity date will
    // be set server-side or by bank users, not by customer users.
    const fifteenDaysFromNow = new Date(
      new Date().getTime() + 15 * 24 * 60 * 60 * 1000
    );
    const maturityDate = loan.origination_date
      ? fifteenDaysAfterDate(new Date(loan.origination_date))
      : fifteenDaysFromNow;

    if (actionType === ActionType.Update) {
      const response = await updateLoan({
        variables: {
          id: loan.id,
          loan: {
            origination_date: loan.origination_date || null,
            amount: loan.amount || null,
            maturity_date: maturityDate,
            adjusted_maturity_date: maturityDate,
          },
        },
      });
      return response.data?.update_loans_by_pk;
    } else {
      const response = await addLoan({
        variables: {
          loan: {
            artifact_id: loan.artifact_id,
            loan_type: LoanTypeEnum.PurchaseOrder,
            origination_date: loan?.origination_date || null,
            amount: loan?.amount || null,
            maturity_date: maturityDate,
            adjusted_maturity_date: maturityDate,
          },
        },
      });
      return response.data?.insert_loans_one;
    }
  };

  const handleClickSaveDraft = async () => {
    const savedLoan = await upsertPurchaseOrderLoan();
    if (!savedLoan) {
      alert("Could not upsert loan");
    }
    handleClose();
  };

  const handleClickSaveSubmit = async () => {
    const savedLoan = await upsertPurchaseOrderLoan();
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
      } else {
        handleClose();
      }
    }
  };

  const isDialogReady =
    !isExistingLoanLoading && !isApprovedPurchaseOrdersLoading;
  const isFormValid = !!loan.artifact_id;
  const isFormLoading = isAddLoanLoading || isUpdateLoanLoading;
  const isSaveDraftDisabled = !isFormValid || isFormLoading;

  // TODO (warrenshen): Make it apparent to the user the reason we are disabling submitting a purchase order
  // for approval, e.g., if they are asking for more than the purchase order is worth.
  const isSaveSubmitDisabled =
    !isFormValid ||
    isFormLoading ||
    isLoanSiblingsLoading ||
    !selectedPurchaseOrder ||
    proposedLoansTotalAmount > selectedPurchaseOrder.amount ||
    !loan?.origination_date ||
    !loan?.amount;

  return isDialogReady ? (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="xl"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle className={classes.dialogTitle}>
        {`${
          actionType === ActionType.Update ? "Edit" : "Create"
        } Inventory Loan`}
      </DialogTitle>
      <DialogContent>
        <PurchaseOrderLoanForm
          canEditPurchaseOrder={actionType === ActionType.New}
          loan={loan}
          setLoan={setLoan}
          approvedPurchaseOrders={approvedPurchaseOrders}
          selectedPurchaseOrder={selectedPurchaseOrder}
        ></PurchaseOrderLoanForm>
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

export default CreateUpdatePurchaseOrderLoanModal;
