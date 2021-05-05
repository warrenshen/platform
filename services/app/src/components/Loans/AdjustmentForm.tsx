import { Box, FormControl, TextField, Typography } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import LoansDataGrid from "components/Loans/LoansDataGrid";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import DateInput from "components/Shared/FormInputs/DateInput";
import {
  LoanFragment,
  PaymentsInsertInput,
  TransactionsInsertInput,
} from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { formatDateString } from "lib/date";
import {
  createLoanCustomerIdentifier,
  createLoanDisbursementIdentifier,
} from "lib/loans";
import { useMemo, useState } from "react";

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
  const [autocompleteInputValue, setAutocompleteInputValue] = useState("");

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
      <Box display="flex" flexDirection="column" mt={3}>
        <FormControl>
          <Autocomplete
            autoHighlight
            id="combo-box-demo"
            options={loans}
            getOptionLabel={(loan) =>
              `${createLoanCustomerIdentifier(
                loan
              )} | ${createLoanDisbursementIdentifier(
                loan
              )} | Amount: ${formatCurrency(
                loan.amount,
                "Error"
              )} | Origination Date: ${
                loan.origination_date
                  ? formatDateString(loan.origination_date)
                  : "Error"
              } | Outstanding Principal: ${formatCurrency(
                loan.outstanding_principal_balance
              )} | Outstanding Interest: ${formatCurrency(
                loan.outstanding_interest
              )} | Outstanding Late Fees: ${formatCurrency(
                loan.outstanding_fees
              )}`
            }
            renderInput={(params) => (
              <TextField {...params} label="Select loan" variant="outlined" />
            )}
            inputValue={autocompleteInputValue}
            value={null}
            onInputChange={(_event, value: string) =>
              setAutocompleteInputValue(value)
            }
            onChange={(_event, loan: LoanFragment | null) =>
              setTransaction({
                ...transaction,
                loan_id: loan?.id || null,
              })
            }
          />
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
        <DateInput
          disableNonBankDays
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
        <DateInput
          disableNonBankDays
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
      <Box display="flex" flexDirection="column" mt={3}>
        <Typography variant="subtitle2">
          How much do you want to adjust outstanding principal by?
        </Typography>
        <Box display="flex" flexDirection="column" mt={1}>
          <FormControl>
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
      <Box display="flex" flexDirection="column" mt={3}>
        <Typography variant="subtitle2">
          How much do you want to adjust outstanding interest by?
        </Typography>
        <Box display="flex" flexDirection="column" mt={1}>
          <FormControl>
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
      <Box display="flex" flexDirection="column" mt={3}>
        <Typography variant="subtitle2">
          How much do you want to adjust outstanding late fees by?
        </Typography>
        <Box display="flex" flexDirection="column" mt={1}>
          <FormControl>
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
