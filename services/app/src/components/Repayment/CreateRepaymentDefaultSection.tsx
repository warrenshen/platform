import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import LoansDataGrid from "components/Loans/LoansDataGrid";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import {
  LoanFragment,
  LoanTypeEnum,
  PaymentsInsertInput,
  ProductTypeEnum,
  useGetLoansByCompanyAndLoanTypeQuery,
} from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { formatDateString } from "lib/date";
import {
  AllPaymentOptions,
  PaymentOptionToLabel,
  ProductTypeToLoanType,
} from "lib/enum";
import { createLoanCustomerIdentifier } from "lib/loans";
import { useMemo, useState } from "react";

interface Props {
  productType: ProductTypeEnum | null;
  payment: PaymentsInsertInput;
  paymentOption: string;
  setPayment: (payment: PaymentsInsertInput) => void;
  setPaymentOption: (paymentOption: string) => void;
}

export default function CreateRepaymentDefaultSection({
  productType,
  payment,
  paymentOption,
  setPayment,
  setPaymentOption,
}: Props) {
  const [autocompleteInputValue, setAutocompleteInputValue] = useState("");

  const loanType =
    !!productType && productType in ProductTypeToLoanType
      ? ProductTypeToLoanType[productType]
      : null;

  const { data } = useGetLoansByCompanyAndLoanTypeQuery({
    skip: !payment || !loanType,
    fetchPolicy: "network-only",
    variables: {
      companyId: payment?.company_id || "",
      loanType: loanType || LoanTypeEnum.PurchaseOrder,
    },
  });
  const selectedLoans = useMemo(
    () =>
      data?.loans.filter(
        (loan) => payment.items_covered.loan_ids.indexOf(loan.id) >= 0
      ) || [],
    [data?.loans, payment.items_covered.loan_ids]
  );
  const notSelectedLoans = useMemo(
    () =>
      data?.loans.filter(
        (loan) =>
          !loan.closed_at && payment.items_covered.loan_ids.indexOf(loan.id) < 0
      ) || [],
    [data?.loans, payment.items_covered.loan_ids]
  );

  return (
    <Box display="flex" flexDirection="column">
      <Typography variant="body2">
        Which loan(s) would you like to pay for?
      </Typography>
      <LoansDataGrid
        isDaysPastDueVisible
        isMaturityVisible
        isSortingDisabled
        loans={selectedLoans}
      />
      <Box display="flex" flexDirection="column" mt={4}>
        <FormControl>
          <Autocomplete
            autoHighlight
            id="combo-box-demo"
            style={{ width: "100%" }}
            options={notSelectedLoans}
            getOptionLabel={(loan) =>
              `${createLoanCustomerIdentifier(loan)} | Amount: ${formatCurrency(
                loan.amount
              )} | Origination Date: ${formatDateString(loan.origination_date)}`
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Add another loan"
                variant="outlined"
              />
            )}
            inputValue={autocompleteInputValue}
            value={null}
            onInputChange={(_event, value: string) =>
              setAutocompleteInputValue(value)
            }
            onChange={(_event, value: LoanFragment | null) => {
              if (value) {
                setPayment({
                  ...payment,
                  items_covered: {
                    ...payment.items_covered,
                    loan_ids: [...payment.items_covered.loan_ids, value.id],
                  },
                });
                setAutocompleteInputValue("");
              }
            }}
          />
        </FormControl>
      </Box>
      <Box mt={4}>
        <Typography variant="subtitle2">
          How much would you like to pay?
        </Typography>
        <Box display="flex" flexDirection="column" mt={1}>
          <FormControl>
            <InputLabel id="select-payment-option-label">
              Payment Option
            </InputLabel>
            <Select
              id="select-payment-option"
              labelId="select-payment-option-label"
              value={paymentOption}
              onChange={({ target: { value } }) =>
                setPaymentOption(value as string)
              }
            >
              {AllPaymentOptions.map((paymentOption) => {
                return (
                  <MenuItem key={paymentOption} value={paymentOption}>
                    {PaymentOptionToLabel[paymentOption]}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>
        {paymentOption === "custom_amount" && (
          <Box display="flex" flexDirection="column" mt={2}>
            <FormControl>
              <CurrencyInput
                label={"Amount"}
                value={payment.amount}
                handleChange={(value) => {
                  setPayment({ ...payment, requested_amount: value });
                }}
              />
            </FormControl>
          </Box>
        )}
      </Box>
    </Box>
  );
}
