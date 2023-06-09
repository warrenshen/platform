import FeeWaiverForm from "components/Fee/FeeWaiverForm";
import Modal from "components/Shared/Modal/Modal";
import {
  Companies,
  PaymentsInsertInput,
  TransactionsInsertInput,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { createAccountLevelFeeWaiverMutation } from "lib/api/payments";
import { PaymentTypeEnum } from "lib/enum";
import { useState } from "react";

interface Props {
  companyId: Companies["id"];
  handleClose: () => void;
}

// Only bank users can create an account level fee waiver.
export default function CreateAccountLevelFeeWaiverModal({
  companyId,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  const [payment, setPayment] = useState<PaymentsInsertInput>({
    company_id: companyId,
    type: PaymentTypeEnum.FeeWaiver,
    amount: null,
    deposit_date: null,
    settlement_date: null,
  });

  const [transaction, setTransaction] = useState<TransactionsInsertInput>({
    type: PaymentTypeEnum.FeeWaiver,
    subtype: null,
  });

  const [
    createAccountLevelFeeWaiver,
    { loading: isCreateAccountLevelFeeWaiverLoading },
  ] = useCustomMutation(createAccountLevelFeeWaiverMutation);

  const handleClickSubmit = async () => {
    const response = await createAccountLevelFeeWaiver({
      variables: {
        company_id: companyId,
        subtype: transaction.subtype,
        amount: payment.amount,
        settlement_date: payment.settlement_date,
        items_covered: payment.items_covered,
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
    isCreateAccountLevelFeeWaiverLoading;

  return (
    <Modal
      isPrimaryActionDisabled={isSubmitDisabled}
      title={"Create Account Fee Waiver"}
      primaryActionText={"Submit"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickSubmit}
    >
      <FeeWaiverForm
        payment={payment}
        transaction={transaction}
        setPayment={setPayment}
        setTransaction={setTransaction}
      />
    </Modal>
  );
}
