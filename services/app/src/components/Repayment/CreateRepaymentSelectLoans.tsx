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
import CreateRepaymentDefaultSection from "components/Repayment/CreateRepaymentDefaultSection";
import CreateRepaymentLineofCreditSection from "components/Repayment/CreateRepaymentLineofCreditSection";
import ExpectedDatePreview from "components/Repayment/ExpectedDatePreview";
import CompanyBank from "components/Shared/BankToBankTransfer/CompanyBank";
import DatePicker from "components/Shared/FormInputs/DatePicker";
import {
  BankAccounts,
  FinancialSummaryFragment,
  PaymentsInsertInput,
  ProductTypeEnum,
} from "generated/graphql";
import {
  AllPaymentMethods,
  PaymentMethodEnum,
  PaymentMethodToLabel,
} from "lib/enum";

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

  return (
    <Box>
      {productType === ProductTypeEnum.LineOfCredit ? (
        <CreateRepaymentLineofCreditSection
          financialSummary={financialSummary}
          payment={payment}
          setPayment={setPayment}
        />
      ) : (
        <CreateRepaymentDefaultSection
          productType={productType}
          payment={payment}
          paymentOption={paymentOption}
          setPayment={setPayment}
          setPaymentOption={setPaymentOption}
        />
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
        <Box mt={4}>
          <Box>
            <Typography variant="subtitle2">
              Which bank account would you like the payment to be withdrawn
              from?
            </Typography>
          </Box>
          <Box mt={2}>
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
