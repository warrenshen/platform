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
import AdjustmentForm from "components/Loans/AdjustmentForm";
import {
  Companies,
  PaymentsInsertInput,
  ProductTypeEnum,
  TransactionsInsertInput,
  useGetActiveLoansForCompanyQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { PaymentTypeEnum, ProductTypeToLoanType } from "lib/enum";
import { createAdjustmentMutation } from "lib/finance/payments/adjustment";
import { useState } from "react";

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
  companyId: Companies["id"];
  productType: ProductTypeEnum;
  handleClose: () => void;
}

// Only bank users can create an adjustment.
function CreateAdjustmentModal({ companyId, productType, handleClose }: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  const loanType =
    !!productType && productType in ProductTypeToLoanType
      ? ProductTypeToLoanType[productType]
      : null;

  const [payment, setPayment] = useState<PaymentsInsertInput>({
    company_id: companyId,
    type: PaymentTypeEnum.Adjustment,
    deposit_date: null,
    settlement_date: null,
  });

  const [transaction, setTransaction] = useState<TransactionsInsertInput>({
    type: PaymentTypeEnum.Adjustment,
    loan_id: null,
    to_principal: null,
    to_interest: null,
    to_fees: null,
  });

  const {
    data,
    loading: isSelectableLoansLoading,
  } = useGetActiveLoansForCompanyQuery({
    variables: {
      companyId,
      loanType,
    },
  });
  const loans = data?.companies_by_pk?.loans || [];

  const [
    createAdjustment,
    { loading: isCreateAdjustmentLoading },
  ] = useCustomMutation(createAdjustmentMutation);

  const handleClickSubmit = async () => {
    const response = await createAdjustment({
      variables: {
        company_id: companyId,
        loan_id: transaction.loan_id,
        to_principal: transaction.to_principal || 0.0,
        to_interest: transaction.to_interest || 0.0,
        to_fees: transaction.to_fees || 0.0,
        deposit_date: payment.deposit_date,
        settlement_date: payment.settlement_date,
      },
    });

    if (response.status !== "OK") {
      snackbar.showError(`Error! Reason: ${response.msg}`);
    } else {
      snackbar.showSuccess("Success! Payment submitted for review by Bespoke.");
      handleClose();
    }
  };

  const isSubmitDisabled =
    !payment.deposit_date ||
    !payment.settlement_date ||
    transaction.to_principal === null ||
    transaction.to_interest === null ||
    transaction.to_fees === null ||
    isSelectableLoansLoading ||
    isCreateAdjustmentLoading;

  return (
    <Dialog open fullWidth maxWidth="md" onClose={handleClose}>
      <DialogTitle className={classes.dialogTitle}>
        Create Adjustment
      </DialogTitle>
      <DialogContent style={{ minHeight: 400 }}>
        <AdjustmentForm
          payment={payment}
          transaction={transaction}
          loans={loans}
          setPayment={setPayment}
          setTransaction={setTransaction}
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
  );
}

export default CreateAdjustmentModal;
