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
  Payments,
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

  // Reverse Draft ACH - schedule section
  const [selectedSchedulePaymentIds, setSelectedSchedulePaymentIds] = useState<
    Payments["id"]
  >([]);

  const handleSelectSchedulePayments = useMemo(
    () => (payments: PaymentLimitedFragment[]) =>
      setSelectedSchedulePaymentIds(payments.map((payment) => payment.id)),
    [setSelectedSchedulePaymentIds]
  );

  // Reverse Draft ACH - settle section
  const [selectedSettlePaymentIds, setSelectedSettlePaymentIds] = useState<
    Payments["id"]
  >([]);

  const handleSelectSettlePayments = useMemo(
    () => (payments: PaymentLimitedFragment[]) =>
      setSelectedSettlePaymentIds(payments.map((payment) => payment.id)),
    [setSelectedSettlePaymentIds]
  );

  // Not Reverse Draft ACH - settle section (notify)
  const [selectedNotifyPaymentIds, setSelectedNotifyPaymentIds] = useState<
    Payments["id"]
  >([]);

  const handleSelectNotifyPayments = useMemo(
    () => (payments: PaymentLimitedFragment[]) =>
      setSelectedNotifyPaymentIds(payments.map((payment) => payment.id)),
    [setSelectedNotifyPaymentIds]
  );

  // Filtered payments
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
                  isDisabled={selectedSchedulePaymentIds.length !== 1}
                  label={"Submit Payment"}
                  modal={({ handleClose }) => (
                    <ScheduleRepaymentModal
                      paymentId={selectedSchedulePaymentIds[0]}
                      handleClose={() => {
                        setSelectedSchedulePaymentIds([]);
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
            selectedPaymentIds={selectedSchedulePaymentIds}
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
                  isDisabled={selectedSettlePaymentIds.length !== 1}
                  label={"Settle Payment"}
                  modal={({ handleClose }) => (
                    <SettleRepaymentModal
                      paymentId={selectedSettlePaymentIds[0]}
                      handleClose={() => {
                        setSelectedSettlePaymentIds([]);
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
            selectedPaymentIds={selectedSettlePaymentIds}
            handleSelectPayments={handleSelectSettlePayments}
          />
        </Box>
        <Box className={classes.sectionSpace} />
        <Box className={classes.section}>
          <Typography variant="h6">Payments - Notifications</Typography>
          <Box mb={2} display="flex" flexDirection="row-reverse">
            <Can perform={Action.SettleRepayment}>
              <Box>
                <ModalButton
                  isDisabled={selectedNotifyPaymentIds.length !== 1}
                  label={"Settle Payment"}
                  modal={({ handleClose }) => (
                    <SettleRepaymentModal
                      paymentId={selectedNotifyPaymentIds[0]}
                      handleClose={() => {
                        setSelectedNotifyPaymentIds([]);
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
            selectedPaymentIds={selectedNotifyPaymentIds}
            handleSelectPayments={handleSelectNotifyPayments}
          />
        </Box>
      </Box>
    </Page>
  );
}

export default BankPaymentsActionRequiredPage;
