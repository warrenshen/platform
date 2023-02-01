import {
  Box,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@material-ui/core";
import SelectLoanAutocomplete from "components/Loan/SelectLoanAutocomplete";
import LoansDataGrid from "components/Loans/LoansDataGrid";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import {
  LoanTypeEnum,
  PaymentsInsertInput,
  useGetOpenFundedLoansByCompanyAndLoanTypeQuery,
} from "generated/graphql";
import {
  CustomerPaymentOptions,
  PaymentOptionToLabel,
  ProductTypeEnum,
  ProductTypeToLoanType,
} from "lib/enum";
import { formatCurrency } from "lib/number";
import { ChangeEvent, Dispatch, SetStateAction, useMemo } from "react";

interface Props {
  productType: ProductTypeEnum;
  payment: PaymentsInsertInput;
  setPayment: (payment: PaymentsInsertInput) => void;
  isPayAccountFeesVisible: boolean;
  setIsPayAccountFeesVisible: Dispatch<SetStateAction<boolean>>;
  accountFeeTotal: number;
}

export default function CreateRepaymentDefaultSection({
  productType,
  payment,
  setPayment,
  isPayAccountFeesVisible,
  setIsPayAccountFeesVisible,
  accountFeeTotal,
}: Props) {
  // Select Loans
  const loanType = ProductTypeToLoanType[productType];

  const { data, error } = useGetOpenFundedLoansByCompanyAndLoanTypeQuery({
    skip: !payment || !loanType,
    fetchPolicy: "network-only",
    variables: {
      companyId: payment?.company_id || "",
      loanType: loanType || LoanTypeEnum.PurchaseOrder,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

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
      <Box>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-end"
        >
          <Typography variant="body1">
            Which loan(s) would you like to pay for?
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={isPayAccountFeesVisible}
                onChange={(_: ChangeEvent<HTMLInputElement>) =>
                  setIsPayAccountFeesVisible(!isPayAccountFeesVisible)
                }
                color="primary"
              />
            }
            label={"Pay account fees"}
          />
        </Box>
        <LoansDataGrid
          isArtifactVisible
          isDaysPastDueVisible
          isMaturityVisible
          isSortingDisabled
          pager={false}
          loans={selectedLoans}
        />
        <Box display="flex" flexDirection="column" mt={4}>
          <SelectLoanAutocomplete
            optionLoans={notSelectedLoans}
            handleSelectLoan={(loan) =>
              setPayment({
                ...payment,
                items_covered: {
                  ...payment.items_covered,
                  loan_ids: [...payment.items_covered.loan_ids, loan.id],
                },
              })
            }
          />
        </Box>
      </Box>
      <Box my={6}>
        <Divider light />
      </Box>
      <Box>
        <Typography variant="subtitle2">
          How much of these outstanding loans would you like to pay for?
        </Typography>
        <Box display="flex" flexDirection="column" mt={1}>
          <FormControl>
            <InputLabel id="select-payment-option-label">
              Payment Option
            </InputLabel>
            <Select
              id="select-payment-option"
              labelId="select-payment-option-label"
              data-cy="repayment-select-payment-option"
              value={payment.items_covered.payment_option || ""}
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
              {CustomerPaymentOptions.map((paymentOption, index) => (
                <MenuItem
                  key={paymentOption}
                  value={paymentOption}
                  data-cy={`repayment-select-payment-option-item-${index}`}
                >
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
                dataCy="create-repayment-custom-amount-input-container"
                handleChange={(value) =>
                  setPayment({
                    ...payment,
                    requested_amount: value || 0.0,
                  })
                }
              />
            </FormControl>
          </Box>
        )}
      </Box>

      {isPayAccountFeesVisible ? (
        <Box my={6}>
          <Typography variant="body2">
            How much of your outstanding acount fees (
            {formatCurrency(accountFeeTotal)}) would you like to pay for?
          </Typography>
          <Box display="flex" flexDirection="column" mt={4}>
            <FormControl>
              <CurrencyInput
                label={"Payment Amount to Account Fees"}
                value={payment.items_covered["requested_to_account_fees"]}
                handleChange={(value) => {
                  setPayment({
                    ...payment,
                    items_covered: {
                      ...payment.items_covered,
                      requested_to_account_fees: value,
                    },
                  });
                }}
              />
            </FormControl>
          </Box>
        </Box>
      ) : (
        <></>
      )}
    </Box>
  );
}
