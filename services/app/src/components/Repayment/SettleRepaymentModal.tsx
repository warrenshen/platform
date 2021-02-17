import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@material-ui/core";
import SettleRepaymentConfirmEffect from "components/Repayment/SettleRepaymentConfirmEffect";
import SettleRepaymentSelectLoans from "components/Repayment/SettleRepaymentSelectLoans";
import {
  GetLoansByLoanIdsQuery,
  Loans,
  Payments,
  PaymentsInsertInput,
  useGetLoansByLoanIdsQuery,
  useGetPaymentForSettlementQuery,
} from "generated/graphql";
import { PaymentOptionEnum } from "lib/enum";
import {
  calculateEffectOfPayment,
  LoanBalance,
} from "lib/finance/payments/repayment";
import { BeforeAfterPaymentLoan } from "lib/types";
import { useEffect, useState } from "react";

interface Props {
  paymentId: Payments["id"];
  handleClose: () => void;
}

function SettleRepaymentModal({ paymentId, handleClose }: Props) {
  // There are 2 states that we show, one when the user is selecting
  // the payment method date, and payment type, and the next is when
  // they have to "confirm" what they have selected.
  const [isOnSelectLoans, setIsOnSelectLoans] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const [beforeAfterPaymentLoans, setBeforeAfterPaymentLoans] = useState<
    BeforeAfterPaymentLoan[]
  >([]);
  console.log({ beforeAfterPaymentLoans });

  const [selectedLoans, setSelectedLoans] = useState<
    GetLoansByLoanIdsQuery["loans"]
  >([]);
  const [selectedLoanIds, setSelectedLoanIds] = useState<Loans["id"][]>([]);

  const { data: dataPayment } = useGetPaymentForSettlementQuery({
    variables: {
      id: paymentId,
    },
    onCompleted: (data) => {
      const payment = data?.payments_by_pk;
      setSelectedLoanIds(payment?.items_covered?.loan_ids || []);
    },
  });

  const payment = dataPayment?.payments_by_pk;
  const customer = payment?.company;

  const { data: dataSelectedLoans } = useGetLoansByLoanIdsQuery({
    variables: {
      loanIds: selectedLoanIds,
    },
  });

  useEffect(() => {
    if (dataSelectedLoans) {
      const selectedLoans = dataSelectedLoans.loans || [];
      setSelectedLoans(selectedLoans);
    }
  }, [dataSelectedLoans]);

  const handleClickNext = async () => {
    if (!payment || !customer) {
      alert("Developer error: payment or customer does not exist.");
      return;
    }

    const response = await calculateEffectOfPayment({
      payment: {
        deposit_date: payment.deposit_date,
      } as PaymentsInsertInput,
      company_id: customer.id,
      payment_option: PaymentOptionEnum.CustomAmount,
      loan_ids: selectedLoanIds,
    });

    if (response.status !== "OK") {
      setErrMsg(response.msg || "");
    } else {
      setErrMsg("");

      if (!response.loans_afterwards) {
        alert("Developer error: response does not include loans_afterwards.");
        return;
      }

      setBeforeAfterPaymentLoans(
        response.loans_afterwards.map((loan_afterwards) => {
          const beforeLoan = selectedLoans.find(
            (selectedLoan) => selectedLoan.id === loan_afterwards.loan_id
          );
          return {
            loan_id: beforeLoan?.id,
            loan_balance_before: {
              outstanding_principal_balance:
                beforeLoan?.outstanding_principal_balance,
              outstanding_interest: beforeLoan?.outstanding_interest,
              outstanding_fees: beforeLoan?.outstanding_fees,
            } as LoanBalance,
            loan_balance_after: {
              outstanding_principal_balance:
                loan_afterwards.loan_balance.outstanding_principal_balance,
              outstanding_interest:
                loan_afterwards.loan_balance.outstanding_interest,
              outstanding_fees: loan_afterwards.loan_balance.outstanding_fees,
            } as LoanBalance,
          } as BeforeAfterPaymentLoan;
        })
      );

      setIsOnSelectLoans(false);
    }
  };

  return payment && customer ? (
    <Dialog open fullWidth maxWidth="md" onClose={handleClose}>
      <DialogTitle>Settle Payment</DialogTitle>
      <DialogContent>
        {isOnSelectLoans ? (
          <SettleRepaymentSelectLoans
            payment={payment}
            selectedLoanIds={selectedLoanIds}
            selectedLoans={selectedLoans}
            setSelectedLoanIds={setSelectedLoanIds}
          />
        ) : (
          <SettleRepaymentConfirmEffect />
        )}
      </DialogContent>
      <DialogActions>
        <Box display="flex" flexDirection="column" width="100%">
          {errMsg && (
            <Box display="flex" justifyContent="flex-end" width="100%">
              <Typography variant="body1" color="secondary">
                {errMsg}
              </Typography>
            </Box>
          )}
          <Box display="flex" justifyContent="flex-end" width="100%">
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              disabled={false}
              variant="contained"
              color="primary"
              onClick={handleClickNext}
            >
              Next
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  ) : null;
}

export default SettleRepaymentModal;
