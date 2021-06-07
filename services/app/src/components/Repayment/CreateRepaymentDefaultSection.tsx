import {
  Box,
  Divider,
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
  LoanTypeEnum,
  PaymentsInsertInput,
  ProductTypeEnum,
  useGetFundedLoansByCompanyAndLoanTypeQuery,
} from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { formatDateString } from "lib/date";
import {
  CustomerPaymentOptions,
  PaymentOptionToLabel,
  ProductTypeToLoanType,
} from "lib/enum";
import { createLoanCustomerIdentifier } from "lib/loans";
import { useMemo, useState } from "react";

interface Props {
  productType: ProductTypeEnum;
  payment: PaymentsInsertInput;
  setPayment: (payment: PaymentsInsertInput) => void;
}

export default function CreateRepaymentDefaultSection({
  productType,
  payment,
  setPayment,
}: Props) {
  const loanType = ProductTypeToLoanType[productType];

  const { data } = useGetFundedLoansByCompanyAndLoanTypeQuery({
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

  const [autocompleteInputValue, setAutocompleteInputValue] = useState("");

  return (
    <Box display="flex" flexDirection="column">
      <Box>
        <Typography variant="body2">
          Which loan(s) would you like to pay for?
        </Typography>
        <LoansDataGrid
          isArtifactVisible
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
              options={notSelectedLoans}
              inputValue={autocompleteInputValue}
              value={null}
              getOptionLabel={(loan) =>
                `${createLoanCustomerIdentifier(
                  loan
                )} | Amount: ${formatCurrency(
                  loan.amount
                )} | Origination Date: ${formatDateString(
                  loan.origination_date
                )}`
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Add another loan"
                  variant="outlined"
                />
              )}
              onChange={(_event, loan) => {
                if (loan) {
                  setPayment({
                    ...payment,
                    items_covered: {
                      ...payment.items_covered,
                      loan_ids: [...payment.items_covered.loan_ids, loan.id],
                    },
                  });
                  setAutocompleteInputValue("");
                }
              }}
              onInputChange={(_event, value) =>
                setAutocompleteInputValue(value)
              }
            />
          </FormControl>
        </Box>
      </Box>
      <Box my={6}>
        <Divider light />
      </Box>
      <Box>
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
              value={payment.items_covered.payment_option}
              onChange={({ target: { value } }) =>
                setPayment({
                  ...payment,
                  items_covered: {
                    ...payment.items_covered,
                    payment_option: value as string,
                  },
                })
              }
            >
              {CustomerPaymentOptions.map((paymentOption) => (
                <MenuItem key={paymentOption} value={paymentOption}>
                  {PaymentOptionToLabel[paymentOption]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        {payment.items_covered.payment_option === "custom_amount" && (
          <Box display="flex" flexDirection="column" mt={4}>
            <FormControl>
              <CurrencyInput
                label={"Custom Amount"}
                value={payment.requested_amount}
                handleChange={(value) =>
                  setPayment({ ...payment, requested_amount: value })
                }
              />
            </FormControl>
          </Box>
        )}
      </Box>
    </Box>
  );
}
