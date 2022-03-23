import { Box, Divider, FormControl, Typography } from "@material-ui/core";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import DateInput from "components/Shared/FormInputs/DateInput";
import Modal from "components/Shared/Modal/Modal";
import {
  PayorFragment,
  Companies,
  PaymentsInsertInput,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { settleAccountLevelFeeRepaymentMutation } from "lib/api/payments";
import { formatCurrency } from "lib/number";
import { RepaymentMethodEnum, RepaymentMethodToLabel } from "lib/enum";
import { useState } from "react";

interface Props {
  customer: Companies;
  payor: PayorFragment;
  payment: PaymentsInsertInput;
  setPayment: React.Dispatch<React.SetStateAction<PaymentsInsertInput>>;
  handleClose: () => void;
}

export default function SettleRepaymentModalAccountFees({
  customer,
  payor,
  payment,
  setPayment,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  const [errMsg, setErrMsg] = useState("");

  const financialSummary = customer?.financial_summaries[0] || null;

  const accountBalancePayload = financialSummary?.account_level_balance_payload;
  const accountFees =
    accountBalancePayload?.fees_total != null
      ? accountBalancePayload.fees_total
      : 0.0;

  const [
    settleAccountLevelFeeRepayment,
    { loading: isSettleAccountLevelFeeRepaymentLoading },
  ] = useCustomMutation(settleAccountLevelFeeRepaymentMutation);

  const handleClickConfirm = async () => {
    if (!payment || !customer) {
      alert("Developer error: payment or customer does not exist.");
      return;
    }

    const response = await settleAccountLevelFeeRepayment({
      variables: {
        company_id: customer.id,
        payment_id: payment.id,
        amount: payment.amount,
        deposit_date: payment.deposit_date,
        settlement_date: payment.settlement_date,
        items_covered: payment.items_covered,
      },
    });

    if (response.status !== "OK") {
      setErrMsg(response.msg || "Error!");
    } else {
      setErrMsg("");
      snackbar.showSuccess("Repayment settled.");
      handleClose();
    }
  };

  const isFormLoading = isSettleAccountLevelFeeRepaymentLoading;
  const isSubmitButtonDisabled =
    isFormLoading ||
    !payment?.amount ||
    !payment?.deposit_date ||
    !payment?.settlement_date;

  return payment && customer ? (
    <Modal
      isPrimaryActionDisabled={isSubmitButtonDisabled}
      title={`Settle ${
        RepaymentMethodToLabel[payment.method as RepaymentMethodEnum]
      } Repayment of Account Fees`}
      contentWidth={1000}
      primaryActionText={"Settle repayment"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickConfirm}
    >
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
              Specify actual amount of this payment.
            </Typography>
            <Box display="flex" flexDirection="column" mt={1}>
              <FormControl>
                <CurrencyInput
                  label={"Amount"}
                  value={payment.amount}
                  handleChange={(value) =>
                    setPayment({
                      ...payment,
                      amount: value,
                      items_covered: {
                        ...payment.items_covered,
                        to_account_fees: value,
                      },
                    })
                  }
                />
              </FormControl>
            </Box>
          </Box>
        </Box>
        <Box mt={4} mb={1}>
          <Typography variant="subtitle2">
            Specify Deposit Date and Settlement Date.
          </Typography>
        </Box>
        <DateInput
          id="payment-date-date-picker"
          label="Deposit Date"
          disableNonBankDays
          value={payment.deposit_date}
          onChange={(value) =>
            setPayment({
              ...payment,
              deposit_date: value,
            })
          }
        />
        <Box mt={1}>
          <Typography variant="body2" color="textSecondary">
            Deposit Date is the date the payment arrived to a Bespoke bank
            account.
          </Typography>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <DateInput
          id="settlement-date-date-picker"
          label="Settlement Date"
          disableNonBankDays
          value={payment.settlement_date}
          onChange={(value) =>
            setPayment({
              ...payment,
              settlement_date: value,
            })
          }
        />
        <Box mt={1}>
          <Typography variant="body2" color="textSecondary">
            Settlement Date is the date the payment is applied to loans. It is
            based off of Deposit Date and Clearance Days.
          </Typography>
        </Box>
      </Box>
      {errMsg && (
        <Box display="flex" width="100%" mt={2}>
          <Typography variant="body1" color="secondary">
            {errMsg}
          </Typography>
        </Box>
      )}
    </Modal>
  ) : null;
}
