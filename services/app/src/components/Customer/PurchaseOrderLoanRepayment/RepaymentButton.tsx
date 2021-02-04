import { Button } from "@material-ui/core";
import { PaymentTransferType } from "components/Shared/BankToBankTransfer";
import PaymentModal from "components/Shared/Payments/RepaymentModal";
import { PaymentsInsertInput } from "generated/graphql";
import useCompanyContext from "hooks/useCompanyContext";
import {
  calculateEffectOfPayment,
  CalculateEffectOfPaymentResp,
  makePayment,
} from "lib/finance/payments/repayment";
import { useState } from "react";

function RepaymentButton() {
  const companyId = useCompanyContext();
  const [open, setOpen] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [
    effectResp,
    setEffectResp,
  ] = useState<CalculateEffectOfPaymentResp | null>(null);

  return (
    <>
      {open && (
        <PaymentModal
          companyId={companyId}
          type={PaymentTransferType.ToBank}
          handleClose={() => setOpen(false)}
          errMsg={errMsg}
          onCreate={async (payment: PaymentsInsertInput) => {
            if (payment.amount && payment.amount.length > 0) {
              payment.amount = parseFloat(payment.amount);
            }
            const resp = await makePayment({
              payment: payment,
              company_id: companyId,
            });
            if (resp.status !== "OK") {
              setErrMsg(resp.msg);
            } else {
              setErrMsg("");
              setOpen(false);
            }
          }}
          onCalculateEffectOfPayment={async (payment: PaymentsInsertInput) => {
            if (payment.amount && payment.amount.length > 0) {
              payment.amount = parseFloat(payment.amount);
            }
            const resp = await calculateEffectOfPayment({
              payment: payment,
              company_id: companyId,
              loan_ids: [],
            });
            if (resp.status !== "OK") {
              setErrMsg(resp.msg || "");
            } else {
              setErrMsg("");
              setEffectResp(resp);
            }
          }}
          effectComponent={() => {
            if (!effectResp) {
              return null;
            }

            let loanIds = [];
            if (effectResp.loans_due) {
              loanIds = effectResp.loans_due.map((l) => {
                return l.id;
              });
            }
            return (
              <div>
                The total due is {effectResp.total_due}. Loans incorporated:{" "}
                {loanIds}
              </div>
            );
          }}
        ></PaymentModal>
      )}
      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        Make a Payment
      </Button>
    </>
  );
}

export default RepaymentButton;
