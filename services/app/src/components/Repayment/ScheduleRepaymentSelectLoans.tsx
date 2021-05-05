import {
  Box,
  createStyles,
  FormControl,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import BankAccountInfoCard from "components/BankAccount/BankAccountInfoCard";
import ExpectedDatePreview from "components/Repayment/ExpectedDatePreview";
import RequestedRepaymentPreview from "components/Repayment/RequestedRepaymentPreview";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import DateInput from "components/Shared/FormInputs/DateInput";
import {
  BankAccounts,
  Companies,
  GetLoansByLoanIdsQuery,
  PaymentsInsertInput,
} from "generated/graphql";

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
  customerBankAccount: BankAccounts | null;
  selectedLoans: GetLoansByLoanIdsQuery["loans"];
  setPayment: (payment: PaymentsInsertInput) => void;
}
function ScheduleRepaymentSelectLoans({
  payment,
  customer,
  customerBankAccount,
  selectedLoans,
  setPayment,
}: Props) {
  const classes = useStyles();

  return payment && customer ? (
    <Box>
      <Box display="flex" flexDirection="column">
        <Typography variant="body1">
          {`${customer.name} requested the following Reverse Draft ACH:`}
        </Typography>
        <Box mt={1}>
          <RequestedRepaymentPreview payment={payment} />
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <Box mb={1}>
          <Typography variant="subtitle2">
            What amount will you trigger the Reverse Draft ACH for?
          </Typography>
        </Box>
        <FormControl className={classes.inputField}>
          <CurrencyInput
            label={"Amount"}
            value={payment.amount}
            handleChange={(value) => {
              setPayment({
                ...payment,
                amount: value,
              });
            }}
          />
        </FormControl>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <Box mb={1}>
          <Typography variant="subtitle2">
            When will you trigger the Reverse Draft ACH?
          </Typography>
        </Box>
        <DateInput
          className={classes.inputField}
          id="payment-date-date-picker"
          label="Payment Date"
          disableNonBankDays
          disabledBefore={payment.requested_payment_date}
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
            Payment Date is the date you initiated or will initiate the Reverse
            Draft ACH.
          </Typography>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <Box>
          <Typography variant="subtitle2">
            What is the expected Deposit Date?
          </Typography>
        </Box>
        <Box mt={1}>
          <ExpectedDatePreview dateString={payment.deposit_date} />
        </Box>
        <Box mt={1}>
          <Typography variant="body2" color="textSecondary">
            Expected Deposit Date is the date we expect the payment to arrive to
            a Bespoke bank account.
          </Typography>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <Box>
          <Typography variant="subtitle2">
            What is the expected Settlement Date?
          </Typography>
        </Box>
        <Box mt={1}>
          <ExpectedDatePreview dateString={payment.settlement_date} />
        </Box>
        <Box mt={1}>
          <Typography variant="body2" color="textSecondary">
            Expected Settlement Date is the date we expect the payment to be
            applied to interest balance (deposit date plus Clearance Days).
          </Typography>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <Box mb={1}>
          <Typography variant="subtitle2">
            Which bank account should you trigger the reverse from?
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {`${customer.name} requested that you withdraw from the following bank account:`}
          </Typography>
        </Box>
        {customerBankAccount && (
          <BankAccountInfoCard bankAccount={customerBankAccount} />
        )}
      </Box>
    </Box>
  ) : null;
}

export default ScheduleRepaymentSelectLoans;
