import BankRepaymentTransactionsDataGrid from "components/Payment/BankRepaymentTransactionsDataGrid";
import UpdateRepaymentBankNoteModal from "components/Repayment/UpdateRepaymentBankNoteModal";
import { useGetRepaymentsSubscription } from "generated/graphql";
import { useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

export default function BankRepaymentsAllTab() {
  const { data } = useGetRepaymentsSubscription();

  const payments = data?.payments || [];

  const [selectedPaymentId, setSelectedPaymentId] = useState(null);

  return (
    <Container>
      {!!selectedPaymentId && (
        <UpdateRepaymentBankNoteModal
          paymentId={selectedPaymentId}
          handleClose={() => setSelectedPaymentId(null)}
        />
      )}
      <BankRepaymentTransactionsDataGrid
        isCompanyVisible
        isFilteringEnabled
        payments={payments}
        handleClickPaymentBankNote={(repaymentId) =>
          setSelectedPaymentId(repaymentId)
        }
      />
    </Container>
  );
}
