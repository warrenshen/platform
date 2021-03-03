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
  useGetOutstandingLoansForCustomerQuery,
} from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { formatCurrency } from "lib/currency";
import { formatDateString } from "lib/date";
import { PaymentMethodEnum, PaymentMethodToLabel } from "lib/enum";
import { useContext } from "react";

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
  const { data } = useGetOutstandingLoansForCustomerQuery({
    variables: {
      companyId: customer.id,
      loanType:
        productType === ProductTypeEnum.LineOfCredit
          ? LoanTypeEnum.LineOfCredit
          : LoanTypeEnum.PurchaseOrder,
    },
  });
  const outstandingLoans = data?.loans || [];

  return payment && customer ? (
    <Box>
      <Box>
        <Typography>
          {`${customer.name} submitted a ${
            PaymentMethodToLabel[payment.method as PaymentMethodEnum]
          } payment of ${formatCurrency(
            payment.amount
          )} with a requested payment date of ${formatDateString(
            payment.requested_payment_date
          )}.`}
        </Typography>
        <Typography>
          {`Please select which loans this payment should apply towards below.
            The loans that ${customer.name} wants to apply this payment towards
            are pre-selected for you, but the final selection is up to your
            discretion.`}
        </Typography>
        <Typography>
          Once you are finished, press "Next" at the bottom to proceed to the
          next step.
        </Typography>
      </Box>
      <Box mt={3}>
        <Box mt={1}>
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
              Payment Date is the date the customer sent or will send the
              payment.
            </Typography>
          </Box>
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
      <Box mt={2}>
        <Typography>Selected loans this payment will apply towards:</Typography>
        <LoansDataGrid
          isSortingDisabled
          isStatusVisible={false}
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
      <Box mt={2}>
        <Typography>Loans not included in the above selection:</Typography>
        <LoansDataGrid
          isSortingDisabled
          loans={outstandingLoans.filter(
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
