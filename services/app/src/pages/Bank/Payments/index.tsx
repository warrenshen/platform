import { Box, Typography } from "@material-ui/core";
import PaymentsDataGrid from "components/Repayment/PaymentsDataGrid";
import SettleRepaymentModal from "components/Repayment/SettleRepaymentModal";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import Page from "components/Shared/Page";
import {
  PaymentFragment,
  useGetPaymentsQuery,
  useGetSubmittedPaymentsQuery,
} from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { useMemo, useState } from "react";

function BankPaymentsPage() {
  const { data, refetch: refetchPayments } = useGetPaymentsQuery();
  const {
    data: submittedPaymentsData,
    refetch: refetchSubmittedPayments,
  } = useGetSubmittedPaymentsQuery();

  const payments = data?.payments || [];
  const submittedPayments = submittedPaymentsData?.payments || [];

  // State for modal(s).
  const [selectedPayments, setSelectedPayments] = useState<PaymentFragment[]>(
    []
  );

  const handleSelectPayments = useMemo(
    () => (payments: PaymentFragment[]) => {
      setSelectedPayments(payments);
    },
    [setSelectedPayments]
  );

  let selectedPaymentId = "";
  if (selectedPayments.length > 0) {
    selectedPaymentId = selectedPayments[0].id;
  }
  return (
    <Page appBarTitle={"Payments"}>
      <Box>
        <Typography variant="h6">Payments - Action Required</Typography>
        <Box mb={2} display="flex" flexDirection="row-reverse">
          <Can perform={Action.SettleRepayment}>
            <Box>
              <ModalButton
                isDisabled={selectedPayments.length !== 1}
                label={"Settle Payment"}
                modal={({ handleClose }) => (
                  <SettleRepaymentModal
                    paymentId={selectedPaymentId}
                    handleClose={() => {
                      refetchPayments();
                      refetchSubmittedPayments();
                      setSelectedPayments([]);
                      handleClose();
                    }}
                  />
                )}
              />
            </Box>
          </Can>
        </Box>
        <PaymentsDataGrid
          payments={submittedPayments}
          customerSearchQuery={""}
          onClickCustomerName={() => {}}
          enableSelect={true}
          handleSelectPayments={handleSelectPayments}
          selectedPaymentIds={selectedPayments.map((p) => {
            return p.id;
          })}
        />
      </Box>
      <Box>
        <Typography variant="h6">Payments - All</Typography>
        <PaymentsDataGrid
          payments={payments}
          customerSearchQuery={""}
          onClickCustomerName={() => {}}
          enableSelect={false}
        />
      </Box>
    </Page>
  );
}

export default BankPaymentsPage;
