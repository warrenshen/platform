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
  FinancialSummaryFragment,
  LoanFragment,
  PaymentsInsertInput,
  ProductTypeEnum,
} from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { todayAsDateStringClient } from "lib/date";
import {
  AllPaymentMethods,
  AllPaymentOptions,
  PaymentMethodEnum,
  PaymentMethodToLabel,
  PaymentOptionToLabel,
} from "lib/enum";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    inputField: {
      width: 300,
    },
  })
);

interface Props {
  productType: ProductTypeEnum | null;
  financialSummary: FinancialSummaryFragment | null;
  selectedLoans: LoanFragment[];
  payment: PaymentsInsertInput;
  paymentOption: string;
  setPayment: (payment: PaymentsInsertInput) => void;
  setPaymentOption: (paymentOption: string) => void;
}

function CreateRepaymentSelectLoans({
  productType,
  financialSummary,
  selectedLoans,
  payment,
  paymentOption,
  setPayment,
  setPaymentOption,
}: Props) {
  const classes = useStyles();
  const isReverseDraftACH =
    payment.method === PaymentMethodEnum.ReverseDraftACH;

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
            You have selected the following loan(s) to make a payment towards.
          </Typography>
          <LoansDataGrid
            isDaysPastDueVisible
            isMaturityVisible
            isSortingDisabled
            loans={selectedLoans}
          />
        </Box>
      )}
      {productType !== ProductTypeEnum.LineOfCredit && (
        <>
          <Box mt={3}>
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
                    handleChange={(value: number) => {
                      setPayment({ ...payment, requested_amount: value });
                    }}
                  />
                </FormControl>
              </Box>
            )}
          </Box>
        </>
      )}
      <Box mt={3}>
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
          <Box mt={3}>
            <Typography variant="subtitle2">
              {isReverseDraftACH
                ? "What date would you like the payment to be withdrawn from your bank account?"
                : "What date did or will the payment leave your bank account?"}
            </Typography>
            <Box mt={1}>
              <DatePicker
                className={classes.inputField}
                id="payment-modal-payment-date-date-picker"
                label={
                  isReverseDraftACH ? "Requested Payment Date" : "Payment Date"
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
          <Box mt={3}>
            <Typography variant="subtitle2">Settlement Date</Typography>
            <Typography variant="body2">
              {`Based on your payment method and ${
                isReverseDraftACH ? "requested" : "specified"
              } payment date, this is the expected date when your payment will count towards your balance.`}
            </Typography>
            <Box mt={1}>
              <DatePicker
                className={classes.inputField}
                id="payment-modal-settlement-date-date-picker"
                label="Settlement Date"
                disabled
                disablePast
                disableNonBankDays
                value={payment.settlement_date}
              />
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}

export default CreateRepaymentSelectLoans;
