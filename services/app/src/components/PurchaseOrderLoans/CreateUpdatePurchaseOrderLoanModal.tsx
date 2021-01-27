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
  useUpdatePurchaseOrderLoanMutation,
} from "generated/graphql";
import { ActionType } from "lib/ActionType";
import { authenticatedApi, purchaseOrderLoansRoutes } from "lib/api";
import { isNull, mergeWith } from "lodash";
import { useState } from "react";
import PurchaseOrderLoanForm from "./PurchaseOrderLoanForm";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      minWidth: "500px",
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
  const newPurchaseOrderLoan = {
    purchase_order_id: "",
    origination_date: null,
    maturity_date: null,
    adjusted_maturity_date: null,
    amount: "",
    status: RequestStatusEnum.Drafted,
  } as PurchaseOrderLoansInsertInput;

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
      if (actionType === ActionType.Update && existingPurchaseOrderLoan) {
        setPurchaseOrderLoan(
          mergeWith(newPurchaseOrderLoan, existingPurchaseOrderLoan, (a, b) =>
            isNull(b) ? a : b
          )
        );
      }
    },
  });
  const [
    addPurchaseOrderLoan,
    { loading: isAddPurchaseOrderLoanLoading },
  ] = useAddPurchaseOrderLoanMutation();

  const [
    updatePurchaseOrderLoan,
    { loading: isUpdatePurchaseOrderLoanLoading },
  ] = useUpdatePurchaseOrderLoanMutation();

  const {
    data,
    loading: isApprovedPurchaseOrdersLoading,
  } = useListApprovedPurchaseOrdersQuery({
    fetchPolicy: "network-only",
  });
  const approvedPurchaseOrders = data?.purchase_orders || [];

  const upsertPurchaseOrderLoan = async () => {
    const dateInFifteenDays = new Date(
      new Date().getTime() + 15 * 24 * 60 * 60 * 1000
    );
    if (actionType === ActionType.Update) {
      const response = await updatePurchaseOrderLoan({
        variables: {
          id: purchaseOrderLoan.id,
          purchaseOrderLoan: {
            purchase_order_id: purchaseOrderLoan.purchase_order_id,
            origination_date: purchaseOrderLoan.origination_date || null,
            amount: purchaseOrderLoan.amount || null,
            status: RequestStatusEnum.Drafted,
          },
        },
      });
      return response.data?.update_purchase_order_loans_by_pk;
    } else {
      const response = await addPurchaseOrderLoan({
        variables: {
          purchaseOrderLoan: {
            purchase_order_id: purchaseOrderLoan.purchase_order_id,
            origination_date: purchaseOrderLoan.origination_date || null,
            maturity_date: dateInFifteenDays,
            adjusted_maturity_date: dateInFifteenDays,
            amount: purchaseOrderLoan.amount || null,
            status: RequestStatusEnum.Drafted,
          },
        },
      });
      return response.data?.insert_purchase_order_loans_one;
    }
  };

  const handleClickSaveDraft = async () => {
    const savedPurchaseOrderLoan = await upsertPurchaseOrderLoan();
    if (!savedPurchaseOrderLoan) {
      alert("Could not upsert purchase order");
    }
    handleClose();
  };

  const handleClickSaveSubmit = async () => {
    const savedPurchaseOrderLoan = await upsertPurchaseOrderLoan();
    if (!savedPurchaseOrderLoan) {
      alert("Could not upsert purchase order");
    } else {
      // Since this is a SAVE AND SUBMIT action,
      // hit the PurchaseOrderLoans.SubmitForApproval endpoint.
      const response = await authenticatedApi.post(
        purchaseOrderLoansRoutes.submitForApproval,
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
    isAddPurchaseOrderLoanLoading || isUpdatePurchaseOrderLoanLoading;
  const isSaveDraftDisabled = !isFormValid || isFormLoading;
  const isSaveSubmitDisabled =
    !isFormValid ||
    isFormLoading ||
    !purchaseOrderLoan.origination_date ||
    !purchaseOrderLoan.amount;

  return isDialogReady ? (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="xl"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle className={classes.dialogTitle}>
        Create Purchase Order Loan
      </DialogTitle>
      <DialogContent>
        <PurchaseOrderLoanForm
          purchaseOrderLoan={purchaseOrderLoan}
          setPurchaseOrderLoan={setPurchaseOrderLoan}
          approvedPurchaseOrders={approvedPurchaseOrders}
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
