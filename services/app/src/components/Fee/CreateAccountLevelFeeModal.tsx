import FeeForm from "components/Fee/FeeForm";
import Modal from "components/Shared/Modal/Modal";
import {
  Companies,
  PaymentsInsertInput,
  TransactionsInsertInput,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { createAccountLevelFeeMutation } from "lib/api/payments";
import { PaymentTypeEnum } from "lib/enum";
import { useState } from "react";

interface Props {
  companyId: Companies["id"];
  handleClose: () => void;
}

// Only bank users can create an account level fee.
export default function CreateAccountLevelFeeModal({
  companyId,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  const [payment, setPayment] = useState<PaymentsInsertInput>({
    company_id: companyId,
    type: PaymentTypeEnum.Fee,
    amount: null,
    deposit_date: null,
    settlement_date: null,
  });

  const [transaction, setTransaction] = useState<TransactionsInsertInput>({
    type: PaymentTypeEnum.Fee,
    subtype: null,
  });

  const [createAccountLevelFee, { loading: isCreateAccountLevelFeeLoading }] =
    useCustomMutation(createAccountLevelFeeMutation);

  const handleClickSubmit = async () => {
    const response = await createAccountLevelFee({
      variables: {
        company_id: companyId,
        subtype: transaction.subtype,
        amount: payment.amount,
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
    !transaction.subtype ||
    isCreateAccountLevelFeeLoading;

  return (
    <Modal
      isPrimaryActionDisabled={isSubmitDisabled}
      title={"Create Account Fee"}
      primaryActionText={"Submit"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickSubmit}
    >
      <FeeForm
        payment={payment}
        transaction={transaction}
        setPayment={setPayment}
        setTransaction={setTransaction}
      />
    </Modal>
  );
}
