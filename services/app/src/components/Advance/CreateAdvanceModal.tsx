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
import { PaymentMethodEnum } from "lib/enum";
import {
  computeSettlementDateForPayment,
  SettlementTimelineConfigForBankAdvance,
} from "lib/finance/payments/advance";
import { useContext, useEffect, useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 900,
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
  const [shouldChargeWireFee, setShouldChargeWireFee] = useState(false);

  useEffect(() => {
    // When user changes payment method or payment date,
    // automatically update expect deposit and settlement dates.
    if (payment.method && payment.payment_date) {
      const settlementDate = computeSettlementDateForPayment(
        payment.method,
        payment.payment_date,
        SettlementTimelineConfigForBankAdvance
      );
      setPayment((payment) => ({
        ...payment,
        deposit_date: settlementDate,
        settlement_date: settlementDate,
      }));
    }
  }, [payment.method, payment.payment_date, setPayment]);

  useEffect(() => {
    // If user selects payment method Wire and amount less than $25,000,
    // automatically check the "Charge Wire Fee" checkbox.
    if (payment.method === PaymentMethodEnum.Wire && payment.amount < 25000) {
      setShouldChargeWireFee(true);
      snackbar.showInfo(
        '"Charge Wire Fee?" auto-checked because amount is less than $25,000.'
      );
    } else if (payment.method !== PaymentMethodEnum.Wire) {
      setShouldChargeWireFee(false);
      // Do not show a snackbar here since the "Charge Wire Fee?" checkbox
      // is not shown when payment method is not Wire.
    }
  }, [
    payment.method,
    payment.amount,
    snackbar,
    setPayment,
    setShouldChargeWireFee,
  ]);

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
      should_charge_wire_fee: shouldChargeWireFee,
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
          shouldChargeWireFee={shouldChargeWireFee}
          setShouldChargeWireFee={setShouldChargeWireFee}
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
