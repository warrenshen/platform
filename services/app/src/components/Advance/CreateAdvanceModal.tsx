import {
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
import { LoanFragment, PaymentsInsertInput } from "generated/graphql";
import { authenticatedApi, loansRoutes } from "lib/api";
import { useContext, useState } from "react";
import PaymentAdvanceForm from "./AdvanceForm";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 600,
    },
    dialogTitle: {
      paddingLeft: theme.spacing(3),
      borderBottom: "1px solid #c7c7c7",
    },
    purchaseOrderInput: {
      width: "200px",
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
  selectedLoans: LoanFragment[];
  handleClose: () => void;
}

function CreateAdvanceModal({ selectedLoans, handleClose }: Props) {
  const classes = useStyles();
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  const loansTotal = selectedLoans.reduce(
    (sum, loan) => sum + loan.amount || 0,
    0
  );

  // Default PurchaseOrder for CREATE case.
  const newPayment = {
    company_id: companyId,
    amount: loansTotal,
    method: "",
  } as PaymentsInsertInput;

  const [payment, setPayment] = useState(newPayment);

  const isDialogReady = true;
  const isFormValid = !!payment.method;
  const isFormLoading = false;
  const isSubmitDisabled = !isFormValid || isFormLoading;

  const handleClickSubmit = async () => {
    const params = {
      payment: {
        amount: payment.amount,
        method: payment.method,
      },
      loan_ids: selectedLoans.map((loan) => loan.id),
    };
    const response = await authenticatedApi.post(
      loansRoutes.createPaymentAdvance,
      params
    );
    if (response.data?.status === "ERROR") {
      alert(response.data?.msg);
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
      <DialogTitle className={classes.dialogTitle}>Create Advance</DialogTitle>
      <DialogContent>
        <PaymentAdvanceForm
          selectedLoans={selectedLoans}
          payment={payment}
          setPayment={setPayment}
        ></PaymentAdvanceForm>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          className={classes.submitButton}
          disabled={isSubmitDisabled}
          onClick={handleClickSubmit}
          variant={"contained"}
          color={"primary"}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  ) : null;
}

export default CreateAdvanceModal;
