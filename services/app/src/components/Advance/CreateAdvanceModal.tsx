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
import { todayAsDateStr } from "lib/date";
import { PaymentMethodEnum } from "lib/enum";
import {
  computeSettlementDateForPayment,
  DefaultSettlementTimelineConfig,
} from "lib/finance/payments/advance";
import { useContext, useState } from "react";
import AdvanceForm from "./AdvanceForm";

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
    payment_date: todayAsDateStr(),
  } as PaymentsInsertInput;

  const [payment, setPayment] = useState(newPayment);

  // We don't have a payment method here so we'll use None. We also don't have
  // a real settlement timeline config here so we'll use the default.
  // As of today (2021.03.02), this computed value will be two biz days after
  // the payment date
  const settlementDate = computeSettlementDateForPayment(
    PaymentMethodEnum.None,
    payment.payment_date,
    DefaultSettlementTimelineConfig
  );

  const isDialogReady = true;
  const isFormValid = !!payment.method;
  const isFormLoading = false;
  const isSubmitDisabled = !isFormValid || isFormLoading;

  const handleClickSubmit = async () => {
    const params = {
      payment: { ...payment, settlement_date: settlementDate },
      loan_ids: selectedLoans.map((loan) => loan.id),
    };
    const response = await authenticatedApi.post(
      loansRoutes.createAdvance,
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
        <AdvanceForm
          selectedLoans={selectedLoans}
          payment={payment}
          setPayment={setPayment}
          settlementDate={settlementDate}
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
