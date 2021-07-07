import { Box, FormControl, Typography } from "@material-ui/core";
import SelectLoanAutocomplete from "components/Loan/SelectLoanAutocomplete";
import LoansDataGrid from "components/Loans/LoansDataGrid";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import DateInput from "components/Shared/FormInputs/DateInput";
import {
  LoanFragment,
  PaymentsInsertInput,
  TransactionsInsertInput,
} from "generated/graphql";
import { useMemo } from "react";

interface Props {
  payment: PaymentsInsertInput;
  transaction: TransactionsInsertInput;
  loans: LoanFragment[];
  setPayment: (payment: PaymentsInsertInput) => void;
  setTransaction: (transaction: TransactionsInsertInput) => void;
}

export default function AdjustmentForm({
  payment,
  transaction,
  loans,
  setPayment,
  setTransaction,
}: Props) {
  const selectedLoans = useMemo(() => {
    const selectedLoan = loans.find((loan) => loan.id === transaction.loan_id);
    return selectedLoan ? [selectedLoan] : [];
  }, [loans, transaction.loan_id]);

  return (
    <Box display="flex" flexDirection="column">
      <Box mt={4}>
        <Typography>
          You are creating an adjustment on a loan. Adjustment values may be
          POSITIVE or NEGATIVE (ex. increase outstanding interest or decrease
          outstanding interest).
        </Typography>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <SelectLoanAutocomplete
          isDisbursementIdentifierVisible
          optionLoans={loans}
          handleSelectLoan={(loan) => {
            setTransaction({
              ...transaction,
              loan_id: loan?.id || null,
            });
          }}
        />
      </Box>
      {selectedLoans.length > 0 && (
        <Box mt={4}>
          <LoansDataGrid
            isDaysPastDueVisible
            isMaturityVisible
            isSortingDisabled
            loans={selectedLoans}
          />
        </Box>
      )}
      <Box display="flex" flexDirection="column" mt={4}>
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
      <Box display="flex" flexDirection="column" mt={4}>
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
      <Box display="flex" flexDirection="column" mt={4}>
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
      <Box display="flex" flexDirection="column" mt={4}>
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
      <Box display="flex" flexDirection="column" mt={4}>
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
