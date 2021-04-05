import {
  Box,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import RepaymentsDataGrid, {
  RepaymentTypeEnum,
} from "components/Repayment/RepaymentsDataGrid";
import ScheduleRepaymentModal from "components/Repayment/ScheduleRepaymentModal";
import SettleRepaymentModal from "components/Repayment/SettleRepaymentModal";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import {
  PaymentLimitedFragment,
  Payments,
  useGetSubmittedPaymentsSubscription,
} from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { useMemo, useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

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

function BankPaymentsActionRequiredTab() {
  const classes = useStyles();

  const { data } = useGetSubmittedPaymentsSubscription();

  const payments = useMemo(() => {
    return data?.payments || [];
  }, [data?.payments]);

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
    <Container>
      <Box className={classes.container}>
        <Box className={classes.section}>
          <Typography variant="h6">Requested Reverse Draft ACHs</Typography>
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
          <RepaymentsDataGrid
            isCompanyVisible
            isMethodVisible={false}
            repaymentType={RepaymentTypeEnum.RequestedReverseDraftACH}
            enableSelect
            isExcelExport
            payments={scheduledPayments}
            customerSearchQuery={""}
            selectedPaymentIds={selectedSchedulePaymentIds}
            handleSelectPayments={handleSelectSchedulePayments}
          />
        </Box>
        <Box className={classes.sectionSpace} />
        <Box className={classes.section}>
          <Typography variant="h6">Submitted Reverse Draft ACHs</Typography>
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
          <RepaymentsDataGrid
            isCompanyVisible
            isMethodVisible={false}
            repaymentType={RepaymentTypeEnum.ReverseDraftACH}
            enableSelect
            isExcelExport
            payments={pendingReverseDraftPayments}
            customerSearchQuery={""}
            selectedPaymentIds={selectedSettlePaymentIds}
            handleSelectPayments={handleSelectSettlePayments}
          />
        </Box>
        <Box className={classes.sectionSpace} />
        <Box className={classes.section}>
          <Typography variant="h6">Notifications</Typography>
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
          <RepaymentsDataGrid
            enableSelect
            isCompanyVisible
            isExcelExport
            repaymentType={RepaymentTypeEnum.Other}
            payments={notifyPayments}
            customerSearchQuery={""}
            selectedPaymentIds={selectedNotifyPaymentIds}
            handleSelectPayments={handleSelectNotifyPayments}
          />
        </Box>
      </Box>
    </Container>
  );
}

export default BankPaymentsActionRequiredTab;
