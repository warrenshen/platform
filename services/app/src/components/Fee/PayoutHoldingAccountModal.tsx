import PayoutHoldingAccountForm from "components/Fee/PayoutHoldingAccountForm";
import Modal from "components/Shared/Modal/Modal";
import { Companies, PaymentsInsertInput } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { disburseCreditToCustomerMutation } from "lib/api/payments";
import { PaymentTypeEnum } from "lib/enum";
import { useState } from "react";

interface Props {
  companyId: Companies["id"];
  handleClose: () => void;
}

// Only bank users can create an account level fee.
export default function PayoutHoldingAccountModal({
  companyId,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  const [payment, setPayment] = useState<PaymentsInsertInput>({
    company_id: companyId,
    type: PaymentTypeEnum.PayoutUserCreditToCustomer,
    amount: null,
    deposit_date: null,
    settlement_date: null,
  });

  const [
    disburseCreditToCustomer,
    { loading: isDisburseCreditToCustomerLoading },
  ] = useCustomMutation(disburseCreditToCustomerMutation);

  const handleClickSubmit = async () => {
    const response = await disburseCreditToCustomer({
      variables: {
        company_id: companyId,
        payment_method: payment.method,
        amount: payment.amount,
        deposit_date: payment.deposit_date,
        settlement_date: payment.settlement_date,
      },
    });

    if (response.status !== "OK") {
      snackbar.showError(`Error: ${response.msg}`);
    } else {
      snackbar.showSuccess("Adjustment created.");
      handleClose();
    }
  };

  const isSubmitDisabled =
    !payment.deposit_date ||
    !payment.settlement_date ||
    !payment.amount ||
    isDisburseCreditToCustomerLoading;

  return (
    <Modal
      isPrimaryActionDisabled={isSubmitDisabled}
      title={"Payout From Holding Account"}
      contentWidth={800}
      primaryActionText={"Submit"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickSubmit}
    >
      <PayoutHoldingAccountForm payment={payment} setPayment={setPayment} />
    </Modal>
  );
}
