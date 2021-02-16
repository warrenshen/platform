import { Box, Typography } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import PaymentsDataGrid from "components/Repayment/PaymentsDataGrid";
import SettleRepaymentModal from "components/Repayment/SettleRepaymentModal";
import Page from "components/Shared/Page";
import {
  useGetPaymentsQuery,
  useGetSubmittedPaymentsQuery,
} from "generated/graphql";
import { useState } from "react";

function BankPaymentsPage() {
  const { data, refetch: refetchPayments } = useGetPaymentsQuery();
  const {
    data: submittedPaymentsData,
    refetch: refetchSubmittedPayments,
  } = useGetSubmittedPaymentsQuery();

  const payments = data?.payments || [];
  const submittedPayments = submittedPaymentsData?.payments || [];

  const [isSettleRepaymentModalOpen, setIsSettleRepaymentModalOpen] = useState(
    false
  );
  const [targetPaymentId, setTargetPaymentId] = useState("");

  return (
    <Page appBarTitle={"Payments"}>
      {isSettleRepaymentModalOpen && (
        <SettleRepaymentModal
          paymentId={targetPaymentId}
          handleClose={() => {
            refetchPayments();
            refetchSubmittedPayments();
            setIsSettleRepaymentModalOpen(false);
          }}
        />
      )}
      <Box>
        <Typography variant="h6">Payments - Action Required</Typography>
        <PaymentsDataGrid
          payments={submittedPayments}
          customerSearchQuery={""}
          onClickCustomerName={() => {}}
          actionItems={[
            {
              key: "settle-repayment",
              label: "Settle Payment",
              handleClick: (params: ValueFormatterParams) => {
                setTargetPaymentId(params.row.data.id as string);
                setIsSettleRepaymentModalOpen(true);
              },
            },
          ]}
        />
      </Box>
      <Box>
        <Typography variant="h6">Payments - All</Typography>
        <PaymentsDataGrid
          payments={payments}
          customerSearchQuery={""}
          onClickCustomerName={() => {}}
        />
      </Box>
    </Page>
  );
}

export default BankPaymentsPage;
