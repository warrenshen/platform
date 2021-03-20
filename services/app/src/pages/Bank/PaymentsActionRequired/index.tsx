import {
  Box,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import PaymentsDataGrid from "components/Repayment/PaymentsDataGrid";
import ScheduleRepaymentModal from "components/Repayment/ScheduleRepaymentModal";
import SettleRepaymentModal from "components/Repayment/SettleRepaymentModal";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import Page from "components/Shared/Page";
import {
  PaymentLimitedFragment,
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

  const payments = useMemo(() => {
    return data?.payments || [];
  }, [data]);

  // Schedule section
  const [selectedScheduledPayments, setSelectedScheduledPayments] = useState<
    PaymentLimitedFragment[]
  >([]);

  const handleSelectSchedulePayments = useMemo(
    () => (payments: PaymentLimitedFragment[]) => {
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

  const scheduledPayments = useMemo(
    () =>
      payments.filter(
        (payment) =>
          payment.method === "reverse_draft_ach" && !payment.payment_date
      ),
    [payments]
  );

  const pendingReverseDraftPayments = useMemo(
    () =>
      payments.filter(
        (payment) =>
          payment.method === "reverse_draft_ach" && !!payment.payment_date
      ),
    [payments]
  );

  const notifyPayments = useMemo(() => {
    return payments.filter((p) => {
      return p.method !== "reverse_draft_ach";
    });
  }, [payments]);

  // Notify section
  const [selectedNotifyPayments, setSelectedNotifyPayments] = useState<
    PaymentLimitedFragment[]
  >([]);

  const seletedNotifyPaymentIds = useMemo(() => {
    return selectedNotifyPayments.map((p) => {
      return p.id;
    });
  }, [selectedNotifyPayments]);

  const handleSelectNotifyPayments = useMemo(
    () => (payments: PaymentLimitedFragment[]) => {
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
        <Box className={classes.section}>
          <Typography variant="h6">
            Payments - Requested Reverse Draft ACHs
          </Typography>
          <Box mb={2} display="flex" flexDirection="row-reverse">
            <Can perform={Action.SettleRepayment}>
              <Box>
                <ModalButton
                  isDisabled={seletedSchedulePaymentIds.length !== 1}
                  label={"Submit Payment"}
                  modal={({ handleClose }) => (
                    <ScheduleRepaymentModal
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
            isCompanyVisible
            isMethodVisible={false}
            enableSelect
            isExcelExport
            payments={scheduledPayments}
            customerSearchQuery={""}
            onClickCustomerName={() => {}}
            selectedPaymentIds={seletedSchedulePaymentIds}
            handleSelectPayments={handleSelectSchedulePayments}
          />
        </Box>
        <Box className={classes.sectionSpace} />
        <Box className={classes.section}>
          <Typography variant="h6">
            Payments - Submitted Reverse Draft ACHs
          </Typography>
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
            isCompanyVisible
            isMethodVisible={false}
            enableSelect
            isExcelExport
            payments={pendingReverseDraftPayments}
            customerSearchQuery={""}
            onClickCustomerName={() => {}}
            selectedPaymentIds={seletedSchedulePaymentIds}
            handleSelectPayments={handleSelectSchedulePayments}
          />
        </Box>
        <Box className={classes.sectionSpace} />
        <Box className={classes.section}>
          <Typography variant="h6">Payments - Notifications</Typography>
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
            isCompanyVisible
            enableSelect
            isExcelExport
            payments={notifyPayments}
            customerSearchQuery={""}
            onClickCustomerName={() => {}}
            selectedPaymentIds={seletedNotifyPaymentIds}
            handleSelectPayments={handleSelectNotifyPayments}
          />
        </Box>
      </Box>
    </Page>
  );
}

export default BankPaymentsActionRequiredPage;
