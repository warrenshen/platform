import {
  Box,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@material-ui/core";
import CompanyBank from "components/Shared/BankToBankTransfer/CompanyBank";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import DateInput from "components/Shared/FormInputs/DateInput";
import {
  BankAccounts,
  FinancialSummaryFragment,
  PaymentsInsertInput,
} from "generated/graphql";
import { formatCurrency } from "lib/currency";
import {
  AllPaymentMethods,
  PaymentMethodEnum,
  PaymentMethodToLabel,
} from "lib/enum";

interface Props {
  isBankUser: boolean;
  financialSummary: FinancialSummaryFragment | null;
  payment: PaymentsInsertInput;
  setPayment: (payment: PaymentsInsertInput) => void;
}

export default function AccountFeesRepaymentForm({
  isBankUser,
  financialSummary,
  payment,
  setPayment,
}: Props) {
  const isReverseDraftACH =
    payment.method === PaymentMethodEnum.ReverseDraftACH;

  const accountBalancePayload = financialSummary?.account_level_balance_payload;
  const accountFees =
    accountBalancePayload?.fees_total != null
      ? accountBalancePayload.fees_total
      : 0.0;

  return (
    <Box>
      <Box>
        <Typography>Accrued Account Fees</Typography>
        <Typography>{formatCurrency(accountFees)}</Typography>
      </Box>
      <Box my={6}>
        <Divider light />
      </Box>
      <Box>
        <Box display="flex" flexDirection="column" mt={4}>
          <Typography variant="subtitle2">
            How much would you like to pay?
          </Typography>
          <Box display="flex" flexDirection="column" mt={1}>
            <FormControl>
              <CurrencyInput
                label={"Amount"}
                value={payment.requested_amount}
                handleChange={(value) =>
                  setPayment({ ...payment, requested_amount: value })
                }
              />
            </FormControl>
          </Box>
        </Box>
      </Box>
      <Box mt={4}>
        <Typography variant="subtitle2">
          Which payment method do you plan to pay with?
        </Typography>
        <Box display="flex" flexDirection="column" mt={1}>
          <FormControl>
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
            <Box display="flex" flexDirection="column" mt={1}>
              <DateInput
                id="payment-modal-payment-date-date-picker"
                label={
                  isReverseDraftACH ? "Requested Withdraw Date" : "Deposit Date"
                }
                disablePast={!isBankUser}
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
