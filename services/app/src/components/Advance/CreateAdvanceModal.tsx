import AdvanceForm from "components/Advance/AdvanceForm";
import Modal from "components/Shared/Modal/Modal";
import {
  Loans,
  PaymentsInsertInput,
  useGetLoansByLoanIdsQuery,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import { authenticatedApi, loansRoutes } from "lib/api";
import { todayAsDateStringServer } from "lib/date";
import { PaymentMethodEnum } from "lib/enum";
import {
  computeSettlementDateForPayment,
  SettlementTimelineConfigForBankAdvance,
} from "lib/finance/payments/advance";
import { useEffect, useState } from "react";

interface Props {
  selectedLoanIds: Loans["id"];
  handleClose: () => void;
}

function CreateAdvanceModal({ selectedLoanIds, handleClose }: Props) {
  const snackbar = useSnackbar();

  const newPayment = {
    amount: null,
    method: "",
    payment_date: todayAsDateStringServer(),
    settlement_date: null,
  } as PaymentsInsertInput;

  const [payment, setPayment] = useState(newPayment);
  const [shouldChargeWireFee, setShouldChargeWireFee] = useState(false);

  const { data } = useGetLoansByLoanIdsQuery({
    variables: {
      loan_ids: selectedLoanIds,
    },
    onCompleted: (data) => {
      const selectedLoans = data?.loans || [];
      setPayment({
        ...payment,
        amount: selectedLoans.reduce((sum, loan) => sum + loan.amount || 0, 0),
      });
    },
  });

  const selectedLoans = data?.loans || [];
  console.log({ data, selectedLoans });

  useEffect(() => {
    // When user changes payment method or payment date,
    // automatically update expect deposit and settlement dates.
    if (payment.method && payment.payment_date) {
      const settlementDate = computeSettlementDateForPayment(
        payment.method,
        payment.payment_date,
        SettlementTimelineConfigForBankAdvance
      );
      setPayment((payment) => ({
        ...payment,
        deposit_date: settlementDate,
        settlement_date: settlementDate,
      }));
    }
  }, [payment.method, payment.payment_date, setPayment]);

  useEffect(() => {
    // If user selects payment method Wire and amount less than $25,000,
    // automatically check the "Charge Wire Fee" checkbox.
    if (payment.method === PaymentMethodEnum.Wire && payment.amount < 25000) {
      setShouldChargeWireFee(true);
      snackbar.showInfo(
        '"Charge Wire Fee?" auto-checked because amount is less than $25,000.'
      );
    } else if (payment.method !== PaymentMethodEnum.Wire) {
      setShouldChargeWireFee(false);
      // Do not show a snackbar here since the "Charge Wire Fee?" checkbox
      // is not shown when payment method is not Wire.
    }
  }, [
    payment.method,
    payment.amount,
    snackbar,
    setPayment,
    setShouldChargeWireFee,
  ]);

  const handleClickSubmit = async () => {
    const response = await authenticatedApi.post(loansRoutes.createAdvance, {
      payment: {
        amount: payment.amount,
        method: payment.method,
        payment_date: payment.payment_date,
        settlement_date: payment.settlement_date,
      },
      loan_ids: selectedLoanIds,
      should_charge_wire_fee: shouldChargeWireFee,
    });

    if (response.data?.status === "ERROR") {
      snackbar.showError(
        `Could not create advance(s). Error: ${response.data?.msg}`
      );
    } else {
      snackbar.showSuccess("Advance(s) created.");
      handleClose();
    }
  };

  const isDialogReady = true;
  const isFormValid = !!payment.method;
  const isFormLoading = false;
  const isSubmitDisabled = !isFormValid || isFormLoading;

  return isDialogReady ? (
    <Modal
      isPrimaryActionDisabled={isSubmitDisabled}
      title={"Create Advance(s)"}
      contentWidth={1000}
      primaryActionText={"Submit"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickSubmit}
    >
      <AdvanceForm
        selectedLoans={selectedLoans}
        payment={payment}
        setPayment={setPayment}
        shouldChargeWireFee={shouldChargeWireFee}
        setShouldChargeWireFee={setShouldChargeWireFee}
      />
    </Modal>
  ) : null;
}

export default CreateAdvanceModal;
