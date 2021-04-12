import {
  Box,
  createStyles,
  FormControl,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  TextField,
  Theme,
  Typography,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import LoansDataGrid from "components/Loans/LoansDataGrid";
import ExpectedDatePreview from "components/Repayment/ExpectedDatePreview";
import CompanyBank from "components/Shared/BankToBankTransfer/CompanyBank";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import DatePicker from "components/Shared/FormInputs/DatePicker";
import {
  BankAccounts,
  FinancialSummaryFragment,
  LoanFragment,
  LoanTypeEnum,
  PaymentsInsertInput,
  ProductTypeEnum,
  useGetLoansByCompanyAndLoanTypeQuery,
} from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { formatDateString, todayAsDateStringClient } from "lib/date";
import {
  AllPaymentMethods,
  AllPaymentOptions,
  PaymentMethodEnum,
  PaymentMethodToLabel,
  PaymentOptionToLabel,
  ProductTypeToLoanType,
} from "lib/enum";
import { createLoanIdentifier } from "lib/loans";
import { useMemo, useState } from "react";

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
  productType: ProductTypeEnum | null;
  financialSummary: FinancialSummaryFragment | null;
  payment: PaymentsInsertInput;
  paymentOption: string;
  setPayment: (payment: PaymentsInsertInput) => void;
  setPaymentOption: (paymentOption: string) => void;
}

function CreateRepaymentSelectLoans({
  productType,
  financialSummary,
  payment,
  paymentOption,
  setPayment,
  setPaymentOption,
}: Props) {
  const classes = useStyles();
  const isReverseDraftACH =
    payment.method === PaymentMethodEnum.ReverseDraftACH;

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
    <Box>
      {productType === ProductTypeEnum.LineOfCredit ? (
        <Box display="flex" flexDirection="column">
          <Box>
            <Typography variant="body1">
              {`As of today, ${todayAsDateStringClient()}, your outstanding principal and interest are:`}
            </Typography>
          </Box>
          <Box mt={1}>
            <Typography variant="body1">
              {`Outstanding Principal: ${
                financialSummary
                  ? formatCurrency(financialSummary.total_outstanding_principal)
                  : "Loading..."
              }`}
            </Typography>
          </Box>
          <Box mt={1}>
            <Typography variant="body1">
              {`Outstanding Interest: ${
                financialSummary
                  ? formatCurrency(financialSummary.total_outstanding_interest)
                  : "Loading..."
              }`}
            </Typography>
          </Box>
        </Box>
      ) : (
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
          <Box display="flex" flexDirection="row" mt={4}>
            <FormControl className={classes.loanInputField}>
              <Autocomplete
                autoHighlight
                id="combo-box-demo"
                style={{ width: "100%" }}
                options={notSelectedLoans}
                getOptionLabel={(loan) =>
                  `${createLoanIdentifier(loan)} | Amount: ${formatCurrency(
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
        </Box>
      )}
      {productType !== ProductTypeEnum.LineOfCredit && (
        <>
          <Box mt={4}>
            <Typography variant="subtitle2">
              How much would you like to pay?
            </Typography>
            <Box mt={1}>
              <FormControl className={classes.inputField}>
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
              <Box mt={2}>
                <FormControl className={classes.inputField}>
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
        </>
      )}
      <Box mt={4}>
        <Typography variant="subtitle2">
          Which payment method do you plan to pay with?
        </Typography>
        <Box mt={1}>
          <FormControl className={classes.inputField}>
            <InputLabel id="select-payment-method-label">
              Payment Method
            </InputLabel>
            <Select
              id="select-payment-method"
              labelId="select-payment-method-label"
              value={payment.method}
              onChange={({ target: { value } }) =>
                setPayment({
                  ...payment,
                  method: value as PaymentMethodEnum,
                  requested_payment_date: null,
                  settlement_date: null,
                })
              }
            >
              {AllPaymentMethods.map((paymentType) => {
                return (
                  <MenuItem key={paymentType} value={paymentType}>
                    {PaymentMethodToLabel[paymentType]}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>
      </Box>
      {payment.method && (
        <>
          <Box mt={4}>
            <Typography variant="subtitle2">
              {isReverseDraftACH
                ? "On which date would you like the payment to be withdrawn from your bank account?"
                : "On which date will the payment arrive to the Bespoke bank account?"}
            </Typography>
            <Box mt={1}>
              <DatePicker
                className={classes.inputField}
                id="payment-modal-payment-date-date-picker"
                label={
                  isReverseDraftACH ? "Requested Withdraw Date" : "Deposit Date"
                }
                disablePast
                disableNonBankDays
                value={payment.requested_payment_date}
                onChange={(value) => {
                  setPayment({
                    ...payment,
                    requested_payment_date: value,
                  });
                }}
              />
            </Box>
          </Box>
          {!!payment.requested_payment_date && (
            <Box mt={4}>
              <Typography variant="subtitle2">
                What is my expected settlement date?
              </Typography>
              <Typography variant="body2">
                {`Based on your payment method and ${
                  isReverseDraftACH
                    ? "requested withdraw date"
                    : "specified deposit date"
                }, this is the expected date when your payment will count towards your balance.`}
              </Typography>
              <Box mt={1}>
                <ExpectedDatePreview dateString={payment.settlement_date} />
              </Box>
            </Box>
          )}
        </>
      )}
      {payment.method === PaymentMethodEnum.ReverseDraftACH && (
        <Box>
          <Box mt={4}>
            <Typography variant="subtitle2">
              Which bank account would you like the payment to be withdrawn
              from?
            </Typography>
          </Box>
          <Box mt={1}>
            <CompanyBank
              companyId={payment.company_id}
              payment={payment}
              onCompanyBankAccountSelection={(id: BankAccounts["id"] | null) =>
                setPayment({ ...payment, company_bank_account_id: id })
              }
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default CreateRepaymentSelectLoans;
