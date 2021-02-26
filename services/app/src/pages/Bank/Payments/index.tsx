import { Box, Typography } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import PaymentsDataGrid from "components/Repayment/PaymentsDataGrid";
import SettleRepaymentModal from "components/Repayment/SettleRepaymentModal";
import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  useGetPaymentsQuery,
  useGetSubmittedPaymentsQuery,
} from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { useState, useContext } from "react";

function BankPaymentsPage() {
  const {
    user: { role },
  } = useContext(CurrentUserContext);

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
          actionItems={
            check(role, Action.SettleRepayment)
              ? [
                  {
                    key: "settle-repayment",
                    label: "Settle Payment",
                    handleClick: (params: ValueFormatterParams) => {
                      setTargetPaymentId(params.row.data.id as string);
                      setIsSettleRepaymentModalOpen(true);
                    },
                  },
                ]
              : []
          }
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
