import {
  Box,
  createStyles,
  FormControl,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  Theme,
  Typography,
} from "@material-ui/core";
import LoansDataGrid from "components/Loans/LoansDataGrid";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import DatePicker from "components/Shared/FormInputs/DatePicker";
import {
  LoanFragment,
  PaymentsInsertInput,
  TransactionsInsertInput,
} from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { formatDateString } from "lib/date";
import { createLoanPublicIdentifier } from "lib/loans";
import { useMemo } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    inputField: {
      width: 300,
    },
    loanInputField: {
      width: "100%",
    },
  })
);

interface Props {
  payment: PaymentsInsertInput;
  transaction: TransactionsInsertInput;
  loans: LoanFragment[];
  setPayment: (payment: PaymentsInsertInput) => void;
  setTransaction: (transaction: TransactionsInsertInput) => void;
}

function AdjustmentForm({
  payment,
  transaction,
  loans,
  setPayment,
  setTransaction,
}: Props) {
  const classes = useStyles();

  const selectedLoans = useMemo(() => {
    const selectedLoan = loans.find((loan) => loan.id === transaction.loan_id);
    return selectedLoan ? [selectedLoan] : [];
  }, [loans, transaction.loan_id]);

  return (
    <Box display="flex" flexDirection="column">
      <Box mt={3}>
        <Typography>
          You are creating an adjustment on a loan. Adjustment values may be
          POSITIVE or NEGATIVE (ex. increase outstanding interest or decrease
          outstanding interest).
        </Typography>
      </Box>
      <Box display="flex" flexDirection="row" mt={3}>
        <FormControl className={classes.loanInputField}>
          <InputLabel id="loan-select-label">Loan</InputLabel>
          <Select
            disabled={loans.length <= 0}
            labelId="loan-select-label"
            id="loan-select"
            value={loans.length > 0 ? transaction.loan_id || "" : ""}
            onChange={({ target: { value } }) =>
              setTransaction({
                ...transaction,
                loan_id: value || null,
              })
            }
          >
            <MenuItem value={""}>
              <em>None</em>
            </MenuItem>
            {loans.map((loan) => (
              <MenuItem key={loan.id} value={loan.id}>
                {`${createLoanPublicIdentifier(loan)} | Amount: ${
                  loan.amount ? formatCurrency(loan.amount) : "Error"
                } | Origination Date: ${
                  loan.origination_date
                    ? formatDateString(loan.origination_date)
                    : "Error"
                }`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {selectedLoans.length > 0 && (
        <Box mt={3}>
          <LoansDataGrid
            isDaysPastDueVisible
            isMaturityVisible
            isSortingDisabled
            loans={selectedLoans}
          />
        </Box>
      )}
      <Box display="flex" flexDirection="column" mt={3}>
        <DatePicker
          disableNonBankDays
          className={classes.inputField}
          id="deposit-date-date-picker"
          label="Deposit Date"
          value={payment.deposit_date}
          onChange={(value) =>
            setPayment({
              ...payment,
              deposit_date: value,
            })
          }
        />
      </Box>
      <Box display="flex" flexDirection="column" mt={3}>
        <DatePicker
          disableNonBankDays
          className={classes.inputField}
          id="settlement-date-date-picker"
          label="Settlement Date"
          value={payment.settlement_date}
          onChange={(value) =>
            setPayment({
              ...payment,
              settlement_date: value,
            })
          }
        />
      </Box>
      <Box mt={3}>
        <Typography variant="subtitle2">
          How much do you want to adjust outstanding principal by?
        </Typography>
        <Box mt={1}>
          <FormControl className={classes.inputField}>
            <CurrencyInput
              label={"To Principal"}
              value={transaction.to_principal}
              handleChange={(value) =>
                setTransaction({
                  ...transaction,
                  to_principal: value,
                })
              }
            />
          </FormControl>
        </Box>
      </Box>
      <Box mt={3}>
        <Typography variant="subtitle2">
          How much do you want to adjust outstanding interest by?
        </Typography>
        <Box mt={1}>
          <FormControl className={classes.inputField}>
            <CurrencyInput
              label={"To Interest"}
              value={transaction.to_interest}
              handleChange={(value) =>
                setTransaction({
                  ...transaction,
                  to_interest: value,
                })
              }
            />
          </FormControl>
        </Box>
      </Box>
      <Box mt={3}>
        <Typography variant="subtitle2">
          How much do you want to adjust outstanding fees by?
        </Typography>
        <Box mt={1}>
          <FormControl className={classes.inputField}>
            <CurrencyInput
              label={"To Fees"}
              value={transaction.to_fees}
              handleChange={(value) =>
                setTransaction({
                  ...transaction,
                  to_fees: value,
                })
              }
            />
          </FormControl>
        </Box>
      </Box>
    </Box>
  );
}

export default AdjustmentForm;
