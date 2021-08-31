import { Box } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import AdvanceForm from "components/Advance/AdvanceForm";
import LoansDataGrid from "components/Loans/LoansDataGrid";
import Modal from "components/Shared/Modal/Modal";
import {
  Loans,
  LoanTypeEnum,
  PaymentsInsertInput,
  useGetLoansByLoanIdsQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { createAdvanceMutation } from "lib/api/payments";
import { todayAsDateStringServer } from "lib/date";
import { PaymentMethodEnum } from "lib/enum";
import {
  computeSettlementDateForPayment,
  SettlementTimelineConfigForBankAdvance,
} from "lib/finance/payments/advance";
import { useEffect, useState } from "react";
import { uniq } from "lodash";

interface Props {
  selectedLoanIds: Loans["id"];
  handleClose: () => void;
}

export default function CreateAdvanceModal({
  selectedLoanIds,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  const newPayment = {
    amount: null,
    method: "",
    payment_date: todayAsDateStringServer(),
    settlement_date: null,
    bank_note: null,
  } as PaymentsInsertInput;

  const [payment, setPayment] = useState(newPayment);
  const [shouldChargeWireFee, setShouldChargeWireFee] = useState(false);

  const { data, error } = useGetLoansByLoanIdsQuery({
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

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const selectedLoans = data?.loans || [];

  const [
    createAdvance,
    { loading: isCreateAdvanceLoading },
  ] = useCustomMutation(createAdvanceMutation);

  useEffect(() => {
    // When user changes advance method or advance date,
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
    // If user selects advance method Wire and amount less than $25,000,
    // automatically check the "Charge Wire Fee" checkbox.
    if (payment.method === PaymentMethodEnum.Wire && payment.amount < 25000) {
      setShouldChargeWireFee(true);
      snackbar.showInfo(
        '"Charge Wire Fee?" auto-checked because amount is less than $25,000.'
      );
    } else if (payment.method !== PaymentMethodEnum.Wire) {
      setShouldChargeWireFee(false);
      // Do not show a snackbar here since the "Charge Wire Fee?" checkbox
      // is not shown when advance method is not Wire.
    }
  }, [
    payment.method,
    payment.amount,
    snackbar,
    setPayment,
    setShouldChargeWireFee,
  ]);

  const handleClickSubmit = async () => {
    const response = await createAdvance({
      variables: {
        payment: {
          amount: payment.amount,
          method: payment.method,
          payment_date: payment.payment_date,
          settlement_date: payment.settlement_date,
          bank_note: payment.bank_note,
        },
        loan_ids: selectedLoanIds,
        should_charge_wire_fee: shouldChargeWireFee,
      },
    });

    if (response.status !== "OK") {
      snackbar.showError(`Could not create advance. Message: ${response.msg}`);
    } else {
      snackbar.showSuccess("Advance created.");
      handleClose();
    }
  };

  const isDialogReady = true;
  const isFormValid = !!payment.method;
  const isFormLoading = isCreateAdvanceLoading;
  const isSubmitDisabled = !isFormValid || isFormLoading;

  const allRecipients = selectedLoans.map((loan) => {
    if (loan.loan_type === LoanTypeEnum.PurchaseOrder) {
      return loan.purchase_order?.vendor_id;
    }
    if (loan.loan_type === LoanTypeEnum.LineOfCredit) {
      return loan.line_of_credit?.recipient_vendor_id || loan.company_id;
    }
    return loan.company_id;
  });
  const uniqueRecipients = uniq(allRecipients);
  const isOnlyOneRecipient = uniqueRecipients.length <= 1;

  if (!isDialogReady) {
    return null;
  }

  return (
    <Modal
      isPrimaryActionDisabled={isSubmitDisabled}
      title={"Create Advance(s)"}
      contentWidth={800}
      primaryActionText={"Submit"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickSubmit}
    >
      <Box mt={4}>
        <LoansDataGrid
          isArtifactVisible
          isCompanyVisible
          isSortingDisabled
          isStatusVisible={false}
          loans={selectedLoans}
        />
      </Box>
      {isOnlyOneRecipient ? (
        <AdvanceForm
          payment={payment}
          setPayment={setPayment}
          shouldChargeWireFee={shouldChargeWireFee}
          setShouldChargeWireFee={setShouldChargeWireFee}
        />
      ) : (
        <Box>
          <Alert severity="warning">
            You've selected loans corresponding to <b>MULTIPLE</b> recipient
            bank accounts. This is not allowed: an advance may only be sent to
            one recipient bank account. Please select different loans and try
            again.
          </Alert>
        </Box>
      )}
    </Modal>
  );
}
