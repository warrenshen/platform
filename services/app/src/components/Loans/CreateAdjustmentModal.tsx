import AdjustmentForm from "components/Loans/AdjustmentForm";
import Modal from "components/Shared/Modal/Modal";
import {
  Companies,
  PaymentsInsertInput,
  ProductTypeEnum,
  TransactionsInsertInput,
  useGetAllLoansForCompanyQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { PaymentTypeEnum, ProductTypeToLoanType } from "lib/enum";
import { createAdjustmentMutation } from "lib/finance/payments/adjustment";
import { useState } from "react";

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum;
  handleClose: () => void;
}

// Only bank users can create an adjustment.
export default function CreateAdjustmentModal({
  companyId,
  productType,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  const loanType = ProductTypeToLoanType[productType];

  const [payment, setPayment] = useState<PaymentsInsertInput>({
    company_id: companyId,
    type: PaymentTypeEnum.Adjustment,
    deposit_date: null,
    settlement_date: null,
  });

  const [transaction, setTransaction] = useState<TransactionsInsertInput>({
    type: PaymentTypeEnum.Adjustment,
    loan_id: null,
    to_principal: null,
    to_interest: null,
    to_fees: null,
  });

  const {
    data,
    loading: isSelectableLoansLoading,
  } = useGetAllLoansForCompanyQuery({
    fetchPolicy: "network-only",
    variables: {
      companyId,
      loanType,
    },
  });
  const loans = data?.companies_by_pk?.loans || [];

  const [
    createAdjustment,
    { loading: isCreateAdjustmentLoading },
  ] = useCustomMutation(createAdjustmentMutation);

  const handleClickSubmit = async () => {
    const response = await createAdjustment({
      variables: {
        company_id: companyId,
        loan_id: transaction.loan_id,
        to_principal: transaction.to_principal || 0.0,
        to_interest: transaction.to_interest || 0.0,
        to_fees: transaction.to_fees || 0.0,
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
    transaction.to_principal === null ||
    transaction.to_interest === null ||
    transaction.to_fees === null ||
    isSelectableLoansLoading ||
    isCreateAdjustmentLoading;

  return (
    <Modal
      isPrimaryActionDisabled={isSubmitDisabled}
      title={"Create Adjustment"}
      contentWidth={800}
      primaryActionText={"Submit"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickSubmit}
    >
      <AdjustmentForm
        payment={payment}
        transaction={transaction}
        loans={loans}
        setPayment={setPayment}
        setTransaction={setTransaction}
      />
    </Modal>
  );
}
