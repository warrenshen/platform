import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import AdvanceForm from "components/Advance/AdvanceForm";
import BankAccountInfoCardContent from "components/BankAccount/BankAccountInfoCardContent";
import LoansDataGrid from "components/Loans/LoansDataGrid";
import CardContainer from "components/Shared/Card/CardContainer";
import CardLine from "components/Shared/Card/CardLine";
import Modal from "components/Shared/Modal/Modal";
import Text, { TextVariants } from "components/Shared/Text/Text";
import {
  BankAccountFragment,
  GetAdvancesBankAccountsForCustomerQuery,
  Loans,
  PaymentsInsertInput,
  useGetAdvancesBankAccountsForCustomerQuery,
  useGetLoansByLoanIdsQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { createAdvanceMutation } from "lib/api/payments";
import { todayAsDateStringServer } from "lib/date";
import { AdvanceMethodEnum } from "lib/enum";
import {
  SettlementTimelineConfigForBankAdvance,
  computeSettlementDateForPayment,
} from "lib/finance/payments/advance";
import {
  extractCustomerId,
  extractRecipientCompanyId,
  extractRecipientCompanyIdAndBankAccountFromPartnership,
  extractVendorId,
} from "lib/loans";
import { useEffect, useState } from "react";

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

  const { data: loansData, error: loansError } = useGetLoansByLoanIdsQuery({
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

  if (loansError) {
    console.error({ error: loansError });
    alert(`Error in query (details in console): ${loansError.message}`);
  }
  const selectedLoans = loansData?.loans || [];

  const customerId = extractCustomerId(selectedLoans);
  const recipientCompanyId = extractRecipientCompanyId(selectedLoans);
  const vendorId = extractVendorId(customerId, recipientCompanyId);

  const { data: advancesBankAccountData, error: advancesBankAccountError } =
    useGetAdvancesBankAccountsForCustomerQuery({
      skip: !recipientCompanyId,
      variables: {
        customerId,
        vendorId,
      },
    });

  if (advancesBankAccountError) {
    console.error({ error: advancesBankAccountError });
    alert(
      `Error in query (details in console): ${advancesBankAccountError.message}`
    );
  }

  /*
   * Two cases to consider for which bank account is recipient bank account:
   * 1. Purchase order loan: recipient is vendor.
   * 2. Line of credit loan: recipient is customer OR vendor.
   */
  const { recipientCompany, advancesBankAccount } =
    extractRecipientCompanyIdAndBankAccountFromPartnership(
      vendorId,
      advancesBankAccountData as GetAdvancesBankAccountsForCustomerQuery
    );
  const isRecipientVendor = !!vendorId;

  const [createAdvance, { loading: isCreateAdvanceLoading }] =
    useCustomMutation(createAdvanceMutation);

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
    if (
      payment.method === AdvanceMethodEnum.Wire &&
      payment.amount < 25000 &&
      advancesBankAccount?.wire_routing_number
    ) {
      setShouldChargeWireFee(true);
      snackbar.showInfo(
        '"Charge Wire Fee?" auto-checked because amount is less than $25,000.'
      );
    } else if (payment.method !== AdvanceMethodEnum.Wire) {
      setShouldChargeWireFee(false);
      // Do not show a snackbar here since the "Charge Wire Fee?" checkbox
      // is not shown when advance method is not Wire.
    }

    if (!!advancesBankAccount) {
      if (
        payment.method === AdvanceMethodEnum.ACH &&
        !advancesBankAccount.routing_number
      ) {
        snackbar.showError(
          "The selected bank account is not enabled for ACH transfers."
        );
      } else if (
        payment.method === AdvanceMethodEnum.Wire &&
        !advancesBankAccount.wire_routing_number
      ) {
        snackbar.showError(
          "The selected bank account is not enabled for Wire transfers."
        );
      }
      if (
        payment.method === AdvanceMethodEnum.ACH &&
        advancesBankAccount.ach_default_memo
      ) {
        setPayment((payment) => ({
          ...payment,
          bank_note: (advancesBankAccount as BankAccountFragment)
            .ach_default_memo,
        }));
        snackbar.showInfo(
          '"Memo" auto-filled to default ACH memo configured on recipient bank account.'
        );
      } else if (
        payment.method === AdvanceMethodEnum.Wire &&
        advancesBankAccount.wire_default_memo
      ) {
        setPayment((payment) => ({
          ...payment,
          bank_note: (advancesBankAccount as BankAccountFragment)
            .wire_default_memo,
        }));
        snackbar.showInfo(
          '"Memo" auto-filled to default Wire memo configured on recipient bank account.'
        );
      }
    }
  }, [
    advancesBankAccount,
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
          recipient_bank_account_id: advancesBankAccount?.id,
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
  const isFormValid =
    !!payment.method &&
    ((payment.method === AdvanceMethodEnum.ACH &&
      advancesBankAccount?.routing_number) ||
      (payment.method === AdvanceMethodEnum.Wire &&
        advancesBankAccount?.wire_routing_number));
  const isFormLoading = isCreateAdvanceLoading;
  const isSubmitDisabled = !isFormValid || isFormLoading;

  if (!isDialogReady) {
    return null;
  }

  return (
    <Modal
      isPrimaryActionDisabled={isSubmitDisabled}
      title={`Create Advance${selectedLoanIds.length > 1 ? "s" : ""}`}
      contentWidth={600}
      primaryActionText={"Submit"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickSubmit}
    >
      <Box mt={3} mb={3}>
        <Typography>
          You are creating an advance for the loan(s) shown below. Please enter
          in information for the advance and then press "Submit".
        </Typography>
      </Box>
      <Text textVariant={TextVariants.ParagraphLead}>
        {selectedLoanIds.length > 1
          ? `Loans (${selectedLoanIds.length})`
          : "Loan"}
      </Text>
      <Box>
        <LoansDataGrid
          isArtifactVisible
          isCompanyVisible
          isSortingDisabled
          isStatusVisible={false}
          pager={false}
          loans={selectedLoans}
        />
      </Box>
      {recipientCompanyId ? (
        <Box>
          <AdvanceForm
            payment={payment}
            setPayment={setPayment}
            shouldChargeWireFee={shouldChargeWireFee}
            setShouldChargeWireFee={setShouldChargeWireFee}
          />
          {!!advancesBankAccount && (
            <Box mt={4}>
              <Text
                textVariant={TextVariants.ParagraphLead}
              >{`Recipient bank information`}</Text>
              <CardLine
                labelText={"Recipient category"}
                valueText={isRecipientVendor ? "Vendor" : "Customer"}
                valueAlignment={"left"}
              />
              <CardLine
                labelText={"Recipient name"}
                valueText={recipientCompany?.name || ""}
                valueAlignment={"left"}
              />
              <Box mt={2}>
                <CardContainer>
                  <BankAccountInfoCardContent
                    isTemplateNameVisible
                    isVerificationVisible
                    bankAccount={advancesBankAccount}
                  />
                </CardContainer>
              </Box>
            </Box>
          )}
        </Box>
      ) : (
        <Box marginTop={3}>
          <Alert severity="error" style={{ alignItems: "center" }}>
            You've selected loans corresponding to <strong>MULTIPLE</strong>{" "}
            recipient bank accounts. This is not allowed: an advance may only be
            sent to one recipient bank account. Please select different loans
            and try again.
          </Alert>
        </Box>
      )}
    </Modal>
  );
}
