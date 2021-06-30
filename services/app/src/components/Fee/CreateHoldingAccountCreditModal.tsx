import CreditForm from "components/Fee/CreditForm";
import Modal from "components/Shared/Modal/Modal";
import { Companies, PaymentsInsertInput } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { createHoldingAccountCreditMutation } from "lib/api/payments";
import { PaymentTypeEnum } from "lib/enum";
import { useState } from "react";

interface Props {
  companyId: Companies["id"];
  handleClose: () => void;
}

// Only bank users can create a holding account credit.
export default function CreateHoldingAccountCreditModal({
  companyId,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  const [payment, setPayment] = useState<PaymentsInsertInput>({
    company_id: companyId,
    type: PaymentTypeEnum.CreditToUser,
    amount: null,
    deposit_date: null,
    settlement_date: null,
  });

  const [
    createHoldingAccountCredit,
    { loading: isCreateHoldingAccountCreditLoading },
  ] = useCustomMutation(createHoldingAccountCreditMutation);

  const handleClickSubmit = async () => {
    const response = await createHoldingAccountCredit({
      variables: {
        company_id: companyId,
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
    isCreateHoldingAccountCreditLoading;

  return (
    <Modal
      isPrimaryActionDisabled={isSubmitDisabled}
      title={"Create Holding Account Credit"}
      primaryActionText={"Submit"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickSubmit}
    >
      <CreditForm payment={payment} setPayment={setPayment} />
    </Modal>
  );
}
