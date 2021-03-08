import {
  Box,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import LoansDataGrid from "components/Loans/LoansDataGrid";
import DatePicker from "components/Shared/Dates/DatePicker";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  Companies,
  GetLoansByLoanIdsQuery,
  Loans,
  LoanTypeEnum,
  PaymentsInsertInput,
  ProductTypeEnum,
  useGetFundedLoansForCompanyQuery,
} from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { formatCurrency } from "lib/currency";
import { formatDateString } from "lib/date";
import { PaymentMethodEnum, PaymentMethodToLabel } from "lib/enum";
import { useContext, useMemo } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    inputField: {
      width: 300,
    },
  })
);

interface Props {
  payment: PaymentsInsertInput;
  customer: Companies;
  selectedLoanIds: Loans["id"][];
  selectedLoans: GetLoansByLoanIdsQuery["loans"];
  setPayment: (payment: PaymentsInsertInput) => void;
  setSelectedLoanIds: (selectedLoanIds: Loans["id"][]) => void;
}
function SettleRepaymentSelectLoans({
  payment,
  customer,
  selectedLoanIds,
  selectedLoans,
  setPayment,
  setSelectedLoanIds,
}: Props) {
  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const classes = useStyles();
  const productType = customer.contract?.product_type;

  // Only loans maturing in 14 days or past due are the ones that may want to be shuffled in.
  const { data } = useGetFundedLoansForCompanyQuery({
    fetchPolicy: "network-only",
    variables: {
      companyId: customer.id,
      loanType:
        productType === ProductTypeEnum.LineOfCredit
          ? LoanTypeEnum.LineOfCredit
          : LoanTypeEnum.PurchaseOrder,
    },
  });
  const maturingOrPastDueLoans = useMemo(
    () =>
      (data?.loans || []).filter((loan) => {
        const pastDueThreshold = new Date(Date.now());
        const matureThreshold = new Date(
          new Date(Date.now()).getTime() + 7 * 24 * 60 * 60 * 1000
        );
        const maturityDate = new Date(loan.maturity_date);
        return (
          matureThreshold > maturityDate || pastDueThreshold > maturityDate
        );
      }),
    [data?.loans]
  );

  return payment && customer ? (
    <Box>
      <Box display="flex" flexDirection="column">
        <Typography variant="body1">
          {`${customer.name} submitted the following payment:`}
        </Typography>
        <Box mt={1}>
          <Typography>
            {`Payment Method: ${
              PaymentMethodToLabel[payment.method as PaymentMethodEnum]
            }`}
          </Typography>
        </Box>
        <Box mt={1}>
          <Typography>
            {`Payment Amount: ${formatCurrency(payment.amount)}`}
          </Typography>
        </Box>
        <Box mt={1}>
          <Typography>
            {`Requested Payment Date: ${formatDateString(
              payment.requested_payment_date
            )}`}
          </Typography>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={3}>
        <Box mb={1}>
          <Typography variant="subtitle2">
            {`Step 1: specify payment and settlement date (settlement date will change when payment date changes).`}
          </Typography>
        </Box>
        <DatePicker
          className={classes.inputField}
          id="payment-date-date-picker"
          label="Payment Date"
          disablePast
          disableNonBankDays
          value={payment.payment_date}
          onChange={(value) => {
            setPayment({
              ...payment,
              payment_date: value,
            });
          }}
        />
        <Box mt={1}>
          <Typography variant="body2" color="textSecondary">
            Payment Date is the date the customer sent or will send the payment.
          </Typography>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={3}>
        <DatePicker
          className={classes.inputField}
          id="settlement-date-date-picker"
          label="Settlement Date"
          disableNonBankDays
          value={payment.settlement_date}
          onChange={(value) =>
            setPayment({
              ...payment,
              settlement_date: value,
            })
          }
        />
        <Box mt={1}>
          <Typography variant="body2" color="textSecondary">
            Settlement date is the date the payment arrived or will arrive to
            the recipient.
          </Typography>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={3}>
        <Box mb={1}>
          <Typography variant="subtitle2">
            {`Step 2: select loans this payment will apply towards. The loans that ${customer.name} suggested are pre-selected, but the final selection is up to your discretion.`}
          </Typography>
        </Box>
        <Typography variant="body1">Selected loans:</Typography>
        <LoansDataGrid
          isDaysPastDueVisible
          isMaturityVisible
          isSortingDisabled
          pager={false}
          loans={selectedLoans}
          actionItems={
            check(role, Action.DeselectLoan)
              ? [
                  {
                    key: "deselect-loan",
                    label: "Remove",
                    handleClick: (params) =>
                      setSelectedLoanIds(
                        selectedLoanIds.filter(
                          (loanId) => loanId !== params.row.data.id
                        )
                      ),
                  },
                ]
              : []
          }
        />
      </Box>
      <Box mt={3}>
        <Typography variant="body1">
          Loans not selected, but past due or maturing in 7 days:
        </Typography>
        <LoansDataGrid
          isDaysPastDueVisible
          isMaturityVisible
          isSortingDisabled
          pageSize={5}
          loans={maturingOrPastDueLoans.filter(
            (loan) => !selectedLoanIds.includes(loan.id)
          )}
          actionItems={
            check(role, Action.SelectLoan)
              ? [
                  {
                    key: "select-loan",
                    label: "Add",
                    handleClick: (params) =>
                      setSelectedLoanIds([
                        ...selectedLoanIds,
                        params.row.data.id as Loans["id"],
                      ]),
                  },
                ]
              : []
          }
        />
      </Box>
    </Box>
  ) : null;
}

export default SettleRepaymentSelectLoans;
