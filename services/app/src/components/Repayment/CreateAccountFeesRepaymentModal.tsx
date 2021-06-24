import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import AccountFeesRepaymentForm from "components/Repayment/AccountFeesRepaymentForm";
import Modal from "components/Shared/Modal/Modal";
import { CurrentCustomerContext } from "contexts/CurrentCustomerContext";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import {
  Companies,
  PaymentsInsertInput,
  ProductTypeEnum,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { createAccountLevelFeeRepaymentMutation } from "lib/api/payments";
import { PaymentTypeEnum } from "lib/enum";
import { useContext, useState } from "react";

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum;
  handleClose: () => void;
}

export default function CreateAccountFeesRepaymentModal({
  companyId,
  productType,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

  const { financialSummary } = useContext(CurrentCustomerContext);

  const [errMsg, setErrMsg] = useState("");

  const [payment, setPayment] = useState<PaymentsInsertInput>({
    company_id: companyId,
    type: PaymentTypeEnum.RepaymentOfAccountFee,
    requested_amount: null,
    method: "",
    requested_payment_date: null,
    company_bank_account_id: null,
  });

  const [
    createAccountLevelFeeRepayment,
    { loading: isCreateAccountLevelFeeRepaymentLoading },
  ] = useCustomMutation(createAccountLevelFeeRepaymentMutation);

  const handleClickConfirm = async () => {
    if (payment.requested_amount <= 0) {
      setErrMsg("Payment amount must be larger than 0");
      return;
    }

    const response = await createAccountLevelFeeRepayment({
      variables: {
        company_id: companyId,
        payment: {
          company_id: payment.company_id,
          type: payment.type,
          requested_amount: payment.requested_amount,
          method: payment.method,
          requested_payment_date: payment.requested_payment_date,
          items_covered: {
            requested_to_account_fees: payment.requested_amount,
          },
          company_bank_account_id: payment.company_bank_account_id,
        },
      },
    });

    if (response.status !== "OK") {
      setErrMsg(response.msg);
    } else {
      setErrMsg("");
      snackbar.showSuccess("Payment submitted for review by Bespoke.");
      handleClose();
    }
  };

  const isFormLoading = isCreateAccountLevelFeeRepaymentLoading;
  const isSubmitButtonDisabled = isFormLoading || payment.requested_amount <= 0;

  return (
    <Modal
      isPrimaryActionDisabled={isSubmitButtonDisabled}
      title={"Make Payment"}
      contentWidth={1000}
      primaryActionText={"Submit"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickConfirm}
    >
      <>
        {isBankUser && (
          <Box mt={2} mb={6}>
            <Alert severity="info">
              <Typography variant="body1">
                Warning: you are creating a payment on behalf of this customer
                (only bank admins can do this).
              </Typography>
            </Alert>
          </Box>
        )}
        <AccountFeesRepaymentForm
          isBankUser={isBankUser}
          financialSummary={financialSummary}
          payment={payment}
          setPayment={setPayment}
        />
        {errMsg && (
          <Box display="flex" width="100%" mt={2}>
            <Typography variant="body1" color="secondary">
              {errMsg}
            </Typography>
          </Box>
        )}
      </>
    </Modal>
  );
}
