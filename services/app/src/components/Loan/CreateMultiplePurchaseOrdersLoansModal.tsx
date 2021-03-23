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
import { Alert } from "@material-ui/lab";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  GetPurchaseOrdersForIdsQuery,
  LoanFragment,
  Loans,
  LoanStatusEnum,
  LoanTypeEnum,
  ProductTypeEnum,
  Scalars,
  useGetCustomerOverviewQuery,
  useGetPurchaseOrdersForIdsQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import {
  PurchaseOrderLoanUpsert,
  upsertPurchaseOrdersLoansMutation,
} from "lib/finance/loans/purchaseOrders";
import { get as getPath } from "lodash";
import { useContext, useState } from "react";
import MultiplePurchaseOrdersLoansForm from "./MultiplePurchaseOrdersLoansForm";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 1000,
    },
    dialogFatalError: {
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

const COPY = {
  submit: {
    [LoanStatusEnum.Drafted]: {
      singular: () => "Your loan was saved as a draft",
      plural: (count: number) => `Your ${count} loans were saved as drafts`,
    },
    [LoanStatusEnum.ApprovalRequested]: {
      singular: () =>
        "Your loan was saved and submitted to Bespoke for approval",
      plural: (count: number) =>
        `Your ${count} loans were saved and submitted to Bespoke for approval`,
    },
  },
};

interface Props {
  artifactIds: Scalars["uuid"][];
  handleClose: () => void;
}

export default function CreateMultiplePurchaseOrdersLoansModal({
  artifactIds,
  handleClose,
}: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  const [paymentDate, setPaymentDate] = useState<string | null>(null);

  const {
    user: { companyId, productType },
  } = useContext(CurrentUserContext);

  const { data: customer } = useGetCustomerOverviewQuery({
    variables: {
      companyId,
      loanType:
        productType === ProductTypeEnum.LineOfCredit
          ? LoanTypeEnum.LineOfCredit
          : LoanTypeEnum.PurchaseOrder,
    },
  });

  const { data: purchaseOrders, loading } = useGetPurchaseOrdersForIdsQuery({
    variables: {
      purchaseOrderIds: artifactIds,
    },
  });

  const [upsertPurchaseOrdersLoans] = useCustomMutation(
    upsertPurchaseOrdersLoansMutation
  );

  if (!customer || loading) {
    return null; // Early Return and wait for the purchase order to show up
  }

  // Perform all of the math
  const computedLoans = computeLoans(purchaseOrders?.purchase_orders || []);
  const loanTotal = sumPossibleLoans(computedLoans);
  const customerBalanceRemainingNow = grabCustomerBalanceRemaining(customer);
  const forecastedBalanceRemaining = customerBalanceRemainingNow - loanTotal;

  // Our only requirement to submit is a paymentDate
  const areButtonsDisabled = !paymentDate;

  // Submission Handler
  const handleClick = async (status: LoanStatusEnum) => {
    const data = decorateLoansWithPaymentDate(computedLoans, paymentDate!);
    const response = await upsertPurchaseOrdersLoans({
      variables: { data, status },
    });

    if (response.status === "ERROR") {
      return snackbar.showMessage(response.msg);
    }
    snackbar.showSuccess(copyWriter(`submit.${status}`, data.length));
    handleClose();
  };

  // Check for possible errors. The fatal errors are:
  //
  // 1. The loans would exceed our balance
  // 2. All the selected POs are fully funded
  // 3. None of the selected POs are approved
  // 4. A combination of [3] and [4]
  //
  // Partial errors are:
  // 1. Some of the selected POs are fully funded
  // 2. Some of the selected POS are not approved
  const returnedPurchaseOrderCount = (purchaseOrders?.purchase_orders || [])
    .length;
  const errBalanceExceeded = forecastedBalanceRemaining < 0;
  const errNoLoansPossible = computedLoans.length === 0;
  const errNumberPOsNotApproved =
    artifactIds.length - returnedPurchaseOrderCount;
  const errNumberPOsFullyFunded =
    returnedPurchaseOrderCount - computedLoans.length;

  const hasFatalError = errBalanceExceeded || errNoLoansPossible;
  const hasPartialError =
    errNumberPOsFullyFunded > 0 || errNumberPOsNotApproved > 0;

  // This rendered error component works for both fatal and partial errors.
  // We instantiate it here because it otherwise makes the main component a
  // gnarly read.
  const err = (
    <Alert severity="warning">
      <span>
        {hasFatalError && (
          <span>
            You cannot take out new loans on the selected purchase orders.{" "}
          </span>
        )}
        {errBalanceExceeded && (
          <span>Doing so would exceed your remaining balance. </span>
        )}
        {errNumberPOsNotApproved > 0 && (
          <span>
            {errNumberPOsNotApproved} of the selected purchase orders{" "}
            {errNumberPOsNotApproved > 1 ? "are " : "is "}
            not yet approved.{" "}
          </span>
        )}
        {errNumberPOsFullyFunded > 0 && (
          <span>
            {errNumberPOsFullyFunded} of the selected purchase orders{" "}
            {errNumberPOsFullyFunded > 1 ? "are " : "is "}
            fully funded.{" "}
          </span>
        )}
        {hasPartialError && !hasFatalError && (
          <span>
            We've removed{" "}
            {errNumberPOsFullyFunded + errNumberPOsNotApproved > 1
              ? "them"
              : "it"}{" "}
            from your selection
          </span>
        )}
      </span>
    </Alert>
  );

  // Return Early on fatal errors. Partial errors are rendered inside of the
  // larger dialog box.
  if (hasFatalError) {
    return (
      <Dialog
        open
        onClose={handleClose}
        classes={{ paper: classes.dialogFatalError }}
        maxWidth="xl"
      >
        <DialogTitle className={classes.dialogTitle}>
          Cannot create loan
        </DialogTitle>
        <DialogContent>
          <Box mt={1}>{err}</Box>
        </DialogContent>
      </Dialog>
    );
  }

  // Finally, actually render the one we'd like rendered
  return (
    <Dialog
      open
      onClose={handleClose}
      classes={{ paper: classes.dialog }}
      maxWidth="xl"
    >
      <DialogTitle className={classes.dialogTitle}>
        Create Multiple Inventory Loans
      </DialogTitle>
      <DialogContent>
        <Box mt={1}>
          <Alert severity="warning">
            <span>
              Note: you are requesting loans for MULTIPLE purchase orders. All
              loans requested will have the same Requested Deposit Date and be
              for the full remaining amount on each purchase order.
            </span>
          </Alert>
        </Box>
        {hasPartialError && <Box>{err}</Box>}
        <MultiplePurchaseOrdersLoansForm
          purchaseOrderLoans={computedLoans}
          paymentDate={paymentDate}
          setPaymentDate={setPaymentDate}
          loanTotal={loanTotal}
          balanceRemaining={customerBalanceRemainingNow}
        />
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Box>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            disabled={areButtonsDisabled}
            onClick={() => handleClick(LoanStatusEnum.Drafted)}
            variant={"contained"}
            color={"secondary"}
          >
            Save as Draft
          </Button>
          <Button
            className={classes.submitButton}
            disabled={areButtonsDisabled}
            onClick={() => handleClick(LoanStatusEnum.ApprovalRequested)}
            variant="contained"
            color="primary"
          >
            Save and Submit
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

const sumAmountForLoans = (loans: Array<Pick<Loans, "id"> & LoanFragment>) =>
  loans.reduce((sum, l) => (sum += l.amount), 0);

const computeLoans = (
  purchaseOrders: GetPurchaseOrdersForIdsQuery["purchase_orders"]
) =>
  purchaseOrders
    .filter((po: any) => !po.funded_at)
    .map(
      (po: any) =>
        ({
          loan: {
            id: null,
            amount:
              po.amount -
              sumAmountForLoans(
                po.loans.filter(
                  (loan: any) => loan.status !== LoanStatusEnum.Drafted
                )
              ),
            artifact_id: po.id,
            requested_payment_date: null,
          },
          artifact: po,
        } as PurchaseOrderLoanUpsert)
    )
    .filter((po: PurchaseOrderLoanUpsert) => po.loan.amount > 0);

const sumPossibleLoans = (computedLoans: PurchaseOrderLoanUpsert[]) =>
  computedLoans.reduce((sum: number, l: any) => (sum += l.loan.amount), 0);

const grabCustomerBalanceRemaining = (data: any) =>
  data.companies_by_pk.financial_summaries[0]?.available_limit;

const decorateLoansWithPaymentDate = (
  loans: PurchaseOrderLoanUpsert[],
  paymentDate: string
) =>
  loans.map((l) => ({
    ...l,
    loan: { ...l.loan, requested_payment_date: paymentDate },
  }));

const copyWriter = (path: string, count: number = 1): string => {
  const isPlural = count > 1;
  const writer = getPath(COPY, path, null);
  if (!writer) {
    return "Unknown";
  }
  return isPlural ? writer.plural(count) : writer.singular();
};
