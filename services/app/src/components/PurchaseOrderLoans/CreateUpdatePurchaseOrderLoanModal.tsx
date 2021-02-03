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
  PurchaseOrderLoansInsertInput,
  RequestStatusEnum,
  useAddPurchaseOrderLoanMutation,
  useListApprovedPurchaseOrdersQuery,
  usePurchaseOrderLoanQuery,
  usePurchaseOrderLoanSiblingsQuery,
  useUpdatePurchaseOrderLoanAndLoanMutation,
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

interface Props {
  actionType: ActionType;
  purchaseOrderLoanId: string | null;
  handleClose: () => void;
}

function CreateUpdatePurchaseOrderLoanModal({
  actionType,
  purchaseOrderLoanId = null,
  handleClose,
}: Props) {
  const classes = useStyles();

  // Default PurchaseOrderLoan for CREATE case.
  const newPurchaseOrderLoan: PurchaseOrderLoansInsertInput = {
    purchase_order_id: "",
    loan: {
      data: {
        origination_date: null,
        maturity_date: null,
        adjusted_maturity_date: null,
        amount: "",
        status: RequestStatusEnum.Drafted,
      },
    },
  };

  const [purchaseOrderLoan, setPurchaseOrderLoan] = useState(
    newPurchaseOrderLoan
  );

  const {
    loading: isExistingPurchaseOrderLoanLoading,
  } = usePurchaseOrderLoanQuery({
    variables: {
      id: purchaseOrderLoanId,
    },
    onCompleted: (data) => {
      const existingPurchaseOrderLoan = data?.purchase_order_loans_by_pk;
      // TODO(warren): A better way to merge so we dont have to hardcode the fields to merge here.
      if (actionType === ActionType.Update && existingPurchaseOrderLoan) {
        newPurchaseOrderLoan.id = existingPurchaseOrderLoan.id;
        newPurchaseOrderLoan.purchase_order_id =
          existingPurchaseOrderLoan.purchase_order_id;
        mergeWith(
          newPurchaseOrderLoan.loan?.data,
          existingPurchaseOrderLoan.loan,
          (a, b) => (isNull(b) ? a : b)
        );
        setPurchaseOrderLoan(newPurchaseOrderLoan);
      }
    },
  });

  const {
    data: purchaseOrderLoanSiblingsData,
    loading: isPurchaseOrderLoanSiblingsLoading,
  } = usePurchaseOrderLoanSiblingsQuery({
    fetchPolicy: "network-only",
    variables: {
      // The `|| null` below is necessary because "" is an invalid parameter to give to the query.
      id: purchaseOrderLoanId || null,
      purchase_order_id: purchaseOrderLoan.purchase_order_id,
    },
  });

  const purchaseOrderLoanSiblings =
    purchaseOrderLoanSiblingsData?.purchase_order_loans || [];
  const siblingsTotalAmount = purchaseOrderLoanSiblings
    .filter((purchaseOrderLoanSibling) =>
      [
        RequestStatusEnum.ApprovalRequested,
        RequestStatusEnum.Approved,
      ].includes(purchaseOrderLoanSibling.loan?.status)
    )
    .reduce(
      (sum, purchaseOrderLoanSibling) =>
        sum + purchaseOrderLoanSibling.loan?.amount || 0,
      0
    );

  const [
    addPurchaseOrderLoan,
    { loading: isAddPurchaseOrderLoanLoading },
  ] = useAddPurchaseOrderLoanMutation();

  const [
    updatePurchaseOrderLoanAndLoan,
    { loading: isUpdatePurchaseOrderLoanAndLoanLoading },
  ] = useUpdatePurchaseOrderLoanAndLoanMutation();

  const {
    data,
    loading: isApprovedPurchaseOrdersLoading,
  } = useListApprovedPurchaseOrdersQuery({
    fetchPolicy: "network-only",
  });

  const loan = purchaseOrderLoan.loan?.data;

  const proposedLoansTotalAmount =
    siblingsTotalAmount + parseFloat(loan?.amount) || 0;

  const approvedPurchaseOrders = data?.purchase_orders || [];

  const selectedPurchaseOrder = approvedPurchaseOrders.find(
    (purchaseOrder) => purchaseOrder.id === purchaseOrderLoan.purchase_order_id
  );

  const upsertPurchaseOrderLoan = async () => {
    const dateInFifteenDays = new Date(
      new Date().getTime() + 15 * 24 * 60 * 60 * 1000
    );
    if (actionType === ActionType.Update) {
      const response = await updatePurchaseOrderLoanAndLoan({
        variables: {
          loanId: loan?.id,
          loan: {
            origination_date: loan?.origination_date || null,
            amount: loan?.amount || null,
          },
          purchaseOrderLoanId: purchaseOrderLoan.id,
          purchaseOrderLoan: {
            purchase_order_id: purchaseOrderLoan.purchase_order_id,
          },
        },
      });
      return response.data?.update_purchase_order_loans_by_pk;
    } else {
      const response = await addPurchaseOrderLoan({
        variables: {
          purchaseOrderLoan: {
            purchase_order_id: purchaseOrderLoan.purchase_order_id,
            loan: {
              data: {
                origination_date: loan?.origination_date || null,
                maturity_date: dateInFifteenDays,
                adjusted_maturity_date: dateInFifteenDays,
                amount: loan?.amount || null,
              },
            },
          },
        },
      });
      return response.data?.insert_purchase_order_loans_one;
    }
  };

  const handleClickSaveDraft = async () => {
    const savedPurchaseOrderLoan = await upsertPurchaseOrderLoan();
    if (!savedPurchaseOrderLoan) {
      alert("Could not upsert purchase order loan");
    }
    handleClose();
  };

  const handleClickSaveSubmit = async () => {
    const savedPurchaseOrderLoan = await upsertPurchaseOrderLoan();
    if (!savedPurchaseOrderLoan) {
      alert("Could not upsert purchase order loan");
    } else {
      // Since this is a SAVE AND SUBMIT action,
      // hit the PurchaseOrderLoans.SubmitForApproval endpoint.
      const response = await authenticatedApi.post(
        loansRoutes.submitForApproval,
        {
          purchase_order_loan_id: savedPurchaseOrderLoan.id,
        }
      );
      if (response.data?.status === "ERROR") {
        alert(response.data?.msg);
      }
    }
    handleClose();
  };

  const isDialogReady =
    !isExistingPurchaseOrderLoanLoading && !isApprovedPurchaseOrdersLoading;
  const isFormValid = !!purchaseOrderLoan.purchase_order_id;
  const isFormLoading =
    isAddPurchaseOrderLoanLoading || isUpdatePurchaseOrderLoanAndLoanLoading;
  const isSaveDraftDisabled = !isFormValid || isFormLoading;

  // TODO(warren): Make it apparent to the user the reason we are disabling submitting a purchase order
  // for approval, e.g., if they are asking for more than the purchase order is worth.
  const isSaveSubmitDisabled =
    !isFormValid ||
    isFormLoading ||
    isPurchaseOrderLoanSiblingsLoading ||
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
        } Purchase Order Loan`}
      </DialogTitle>
      <DialogContent>
        <PurchaseOrderLoanForm
          purchaseOrderLoan={purchaseOrderLoan}
          setPurchaseOrderLoan={setPurchaseOrderLoan}
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
