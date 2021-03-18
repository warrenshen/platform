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
import AdvanceForm from "components/Advance/AdvanceForm";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { LoanFragment, PaymentsInsertInput } from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import { authenticatedApi, loansRoutes } from "lib/api";
import { todayAsDateStringServer } from "lib/date";
import {
  computeSettlementDateForPayment,
  DefaultSettlementTimelineConfig,
} from "lib/finance/payments/advance";
import { useContext, useEffect, useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 600,
    },
    dialogTitle: {
      borderBottom: "1px solid #c7c7c7",
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
  selectedLoans: LoanFragment[];
  handleClose: () => void;
}

function CreateAdvanceModal({ selectedLoans, handleClose }: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();
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
    payment_date: todayAsDateStringServer(),
    settlement_date: null,
  } as PaymentsInsertInput;

  const [payment, setPayment] = useState(newPayment);

  useEffect(() => {
    if (payment.method && payment.payment_date) {
      // We don't have a payment method here so we'll use None. We also don't have
      // a real settlement timeline config here so we'll use the default.
      // As of today (2021.03.02), this computed value will be two biz days after
      // the payment date
      const settlementDate = computeSettlementDateForPayment(
        payment.method,
        payment.payment_date,
        DefaultSettlementTimelineConfig
      );
      setPayment((payment) => ({
        ...payment,
        settlement_date: settlementDate,
      }));
    }
  }, [payment.method, payment.payment_date, setPayment]);

  const handleClickSubmit = async () => {
    const params = {
      payment: {
        company_id: payment.company_id,
        amount: payment.amount,
        method: payment.method,
        payment_date: payment.payment_date,
        settlement_date: payment.settlement_date,
      },
      loan_ids: selectedLoans.map((loan) => loan.id),
      should_charge_wire_fee: false, // TODO(warren): Support this feature in the frontend
    };
    const response = await authenticatedApi.post(
      loansRoutes.createAdvance,
      params
    );
    if (response.data?.status === "ERROR") {
      snackbar.showError(
        `Error! Could not create advance. Reason: ${response.data?.msg}`
      );
    } else {
      snackbar.showSuccess("Success! Advance created.");
      handleClose();
    }
  };

  const isDialogReady = true;
  const isFormValid = !!payment.method;
  const isFormLoading = false;
  const isSubmitDisabled = !isFormValid || isFormLoading;

  return isDialogReady ? (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="xl"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle className={classes.dialogTitle}>Create Advance</DialogTitle>
      <DialogContent>
        <AdvanceForm
          selectedLoans={selectedLoans}
          payment={payment}
          setPayment={setPayment}
        />
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
