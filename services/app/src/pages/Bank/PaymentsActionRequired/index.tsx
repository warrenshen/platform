import {
  Box,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import PaymentsDataGrid from "components/Repayment/PaymentsDataGrid";
import SettleRepaymentModal from "components/Repayment/SettleRepaymentModal";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import Page from "components/Shared/Page";
import {
  PaymentFragment,
  useGetSubmittedPaymentsQuery,
} from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { useMemo, useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: "flex",
      flexDirection: "column",

      width: "100%",
    },
    section: {
      display: "flex",
      flexDirection: "column",
    },
    sectionSpace: {
      height: theme.spacing(4),
    },
  })
);

function BankPaymentsActionRequiredPage() {
  const classes = useStyles();

  const {
    data: submittedPaymentsData,
    refetch: refetchSubmittedPayments,
  } = useGetSubmittedPaymentsQuery();

  const submittedPayments = submittedPaymentsData?.payments || [];

  // State for modal(s).
  const [selectedNotifyPayments, setSelectedNotifyPayments] = useState<
    PaymentFragment[]
  >([]);
  const [selectedScheduledPayments, setSelectedScheduledPayments] = useState<
    PaymentFragment[]
  >([]);

  const handleSelectSchedulePayments = useMemo(
    () => (payments: PaymentFragment[]) => {
      setSelectedScheduledPayments(payments);
    },
    [setSelectedScheduledPayments]
  );

  const handleSelectNotifyPayments = useMemo(
    () => (payments: PaymentFragment[]) => {
      setSelectedNotifyPayments(payments);
    },
    [setSelectedNotifyPayments]
  );

  const seletedSchedulePaymentIds = selectedScheduledPayments.map((p) => {
    return p.id;
  });

  const seletedNotifyPaymentIds = selectedNotifyPayments.map((p) => {
    return p.id;
  });

  const scheduledPayments = submittedPayments.filter((p) => {
    return p.method === "reverse_draft_ach";
  });
  const notifyPayments = submittedPayments.filter((p) => {
    return p.method !== "reverse_draft_ach";
  });

  let scheduledPaymentId = "";
  if (seletedSchedulePaymentIds.length > 0) {
    scheduledPaymentId = selectedScheduledPayments[0].id;
  }
  let notifyPaymentId = "";
  if (seletedNotifyPaymentIds.length > 0) {
    notifyPaymentId = seletedNotifyPaymentIds[0].id;
  }

  return (
    <Page appBarTitle={"Payments - Action Required"}>
      <Box className={classes.container}>
        <Typography variant="h6">Payments - Reverse Draft ACH</Typography>
        <Box mb={2} display="flex" flexDirection="row-reverse">
          <Can perform={Action.SettleRepayment}>
            <Box>
              <ModalButton
                isDisabled={seletedSchedulePaymentIds.length !== 1}
                label={"Settle Payment"}
                modal={({ handleClose }) => (
                  <SettleRepaymentModal
                    paymentId={scheduledPaymentId}
                    handleClose={() => {
                      refetchSubmittedPayments();
                      setSelectedScheduledPayments([]);
                      handleClose();
                    }}
                  />
                )}
              />
            </Box>
          </Can>
        </Box>
        <PaymentsDataGrid
          payments={scheduledPayments}
          customerSearchQuery={""}
          onClickCustomerName={() => {}}
          enableSelect={true}
          selectedPaymentIds={seletedSchedulePaymentIds}
          handleSelectPayments={handleSelectSchedulePayments}
        />
      </Box>
      <Box className={classes.sectionSpace} />
      <Box className={classes.container}>
        <Typography variant="h6">Payments - Notified</Typography>
        <Box mb={2} display="flex" flexDirection="row-reverse">
          <Can perform={Action.SettleRepayment}>
            <Box>
              <ModalButton
                isDisabled={seletedNotifyPaymentIds.length !== 1}
                label={"Settle Payment"}
                modal={({ handleClose }) => (
                  <SettleRepaymentModal
                    paymentId={notifyPaymentId}
                    handleClose={() => {
                      refetchSubmittedPayments();
                      setSelectedNotifyPayments([]);
                      handleClose();
                    }}
                  />
                )}
              />
            </Box>
          </Can>
        </Box>
        <PaymentsDataGrid
          payments={notifyPayments}
          customerSearchQuery={""}
          onClickCustomerName={() => {}}
          enableSelect={true}
          selectedPaymentIds={seletedNotifyPaymentIds}
          handleSelectPayments={handleSelectNotifyPayments}
        />
      </Box>
    </Page>
  );
}

export default BankPaymentsActionRequiredPage;
