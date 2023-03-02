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
import CreateRepaymentDefaultSection from "components/Repayment/CreateRepaymentDefaultSection";
import CreateRepaymentLineofCreditSection from "components/Repayment/CreateRepaymentLineofCreditSection";
import ExpectedDatePreview from "components/Repayment/ExpectedDatePreview";
import CompanyBank from "components/Shared/BankToBankTransfer/CompanyBank";
import DateInput from "components/Shared/FormInputs/DateInput";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import {
  BankAccounts,
  FinancialSummaryFragment,
  PaymentsInsertInput,
} from "generated/graphql";
import { computeRequestedWithdrawCutoffDate } from "lib/date";
import {
  AllRepaymentMethods,
  ProductTypeEnum,
  RepaymentMethodEnum,
  RepaymentMethodToDropdownLabel,
} from "lib/enum";
import { Dispatch, SetStateAction, useContext } from "react";

interface Props {
  productType: ProductTypeEnum;
  financialSummary: FinancialSummaryFragment | null;
  payment: PaymentsInsertInput;
  setPayment: (payment: PaymentsInsertInput) => void;
  isPayAccountFeesVisible: boolean;
  setIsPayAccountFeesVisible: Dispatch<SetStateAction<boolean>>;
  accountFeeTotal: number;
}

export default function CreateRepaymentSelectLoans({
  productType,
  financialSummary,
  payment,
  setPayment,
  isPayAccountFeesVisible,
  setIsPayAccountFeesVisible,
  accountFeeTotal,
}: Props) {
  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

  const isReverseDraftACH =
    payment.method === RepaymentMethodEnum.ReverseDraftACH;
  /**
   * If payment method is reverse draft ACH and today's date is X,
   * the earliest the payment date of repayment may be is:
   *
   * Step 1: figure out Y (the 1st business day starting from X).
   * 1. X is a business day, Y equals X.
   * 2. X is a NOT a business day, Y equals the soonest business day after X.
   *
   * Step 2: calculate earliest payment date based on Y.
   * 1. 1 business day after Y, if it is currently before 12pm (user's timezone).
   * 2. 2 business days after Y, if it is currently after 12pm (user's timezone).
   *
   * The above rules give Bespoke Financial's Operations team time to
   * set up a reverse draft ACH repayment with the desired payment date.
   */
  const disabledBefore = isReverseDraftACH
    ? // ? computeRequestedWithdrawCutoffDate(todayAsDateStringServer())
      computeRequestedWithdrawCutoffDate("2022-01-15")
    : undefined;

  return (
    <Box>
      <Box>
        {productType === ProductTypeEnum.LineOfCredit ? (
          <CreateRepaymentLineofCreditSection
            financialSummary={financialSummary}
            payment={payment}
            setPayment={setPayment}
            isPayAccountFeesVisible={isPayAccountFeesVisible}
            setIsPayAccountFeesVisible={setIsPayAccountFeesVisible}
            accountFeeTotal={accountFeeTotal}
          />
        ) : (
          <CreateRepaymentDefaultSection
            productType={productType}
            payment={payment}
            setPayment={setPayment}
            isPayAccountFeesVisible={isPayAccountFeesVisible}
            setIsPayAccountFeesVisible={setIsPayAccountFeesVisible}
            accountFeeTotal={accountFeeTotal}
          />
        )}
      </Box>
      <Box my={6}>
        <Divider light />
      </Box>
      <Box>
        <Typography variant="subtitle2">
          Which repayment method do you plan to pay with?
        </Typography>
        <Box display="flex" flexDirection="column" mt={1}>
          <FormControl>
            <InputLabel id="select-payment-method-label">
              Repayment Method
            </InputLabel>
            <Select
              id="select-payment-method"
              labelId="select-payment-method-label"
              data-cy="repayment-select-payment-method"
              value={payment.method}
              onChange={({ target: { value } }) =>
                setPayment({
                  ...payment,
                  method: value as RepaymentMethodEnum,
                  requested_payment_date: null,
                  settlement_date: null,
                })
              }
            >
              {AllRepaymentMethods.map((paymentType, index) => {
                return (
                  <MenuItem
                    key={paymentType}
                    value={paymentType}
                    data-cy={`repayment-select-payment-method-item-${index}`}
                  >
                    {RepaymentMethodToDropdownLabel[paymentType]}
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
                dataCy="payment-modal-payment-date-date-picker"
                label={
                  isReverseDraftACH ? "Requested Withdraw Date" : "Deposit Date"
                }
                disableNonBankDays
                disabledBefore={disabledBefore}
                value={payment.requested_payment_date}
                onChange={(value) =>
                  setPayment({
                    ...payment,
                    requested_payment_date: value,
                  })
                }
              />
            </Box>
          </Box>
          {!!payment.requested_payment_date && (
            <Box mt={4}>
              <Typography variant="subtitle2">
                What is my expected settlement date?
              </Typography>
              <Typography variant="body2">
                {`Based on your repayment method and ${
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
      {payment.method === RepaymentMethodEnum.ReverseDraftACH && (
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
      {isBankUser && (
        <Box>
          <Box my={3}>
            <Divider light />
          </Box>
          <FormControl fullWidth>
            <TextField
              label="Bank Note"
              value={payment.bank_note || ""}
              onChange={({ target: { value } }) =>
                setPayment({ ...payment, bank_note: value })
              }
            />
          </FormControl>
        </Box>
      )}
    </Box>
  );
}
