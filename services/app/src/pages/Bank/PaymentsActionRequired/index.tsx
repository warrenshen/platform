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
  useGetSubmittedPaymentsSubscription,
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

  const { data } = useGetSubmittedPaymentsSubscription();

  const submittedPayments = useMemo(() => {
    return data?.payments || [];
  }, [data]);

  // Schedule section
  const [selectedScheduledPayments, setSelectedScheduledPayments] = useState<
    PaymentFragment[]
  >([]);

  const handleSelectSchedulePayments = useMemo(
    () => (payments: PaymentFragment[]) => {
      setSelectedScheduledPayments(payments);
    },
    [setSelectedScheduledPayments]
  );

  let scheduledPaymentId = useMemo(() => {
    if (selectedScheduledPayments.length > 0) {
      return selectedScheduledPayments[0].id;
    }
    return "";
  }, [selectedScheduledPayments]);

  const seletedSchedulePaymentIds = useMemo(() => {
    return selectedScheduledPayments.map((p) => {
      return p.id;
    });
  }, [selectedScheduledPayments]);

  const scheduledPayments = useMemo(() => {
    return submittedPayments.filter((p) => {
      return p.method === "reverse_draft_ach";
    });
  }, [submittedPayments]);

  // Notify section
  const [selectedNotifyPayments, setSelectedNotifyPayments] = useState<
    PaymentFragment[]
  >([]);

  const notifyPayments = useMemo(() => {
    return submittedPayments.filter((p) => {
      return p.method !== "reverse_draft_ach";
    });
  }, [submittedPayments]);

  const seletedNotifyPaymentIds = useMemo(() => {
    return selectedNotifyPayments.map((p) => {
      return p.id;
    });
  }, [selectedNotifyPayments]);

  const handleSelectNotifyPayments = useMemo(
    () => (payments: PaymentFragment[]) => {
      setSelectedNotifyPayments(payments);
    },
    [setSelectedNotifyPayments]
  );

  let notifyPaymentId = useMemo(() => {
    if (selectedNotifyPayments.length > 0) {
      return selectedNotifyPayments[0].id;
    }
    return "";
  }, [selectedNotifyPayments]);

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
