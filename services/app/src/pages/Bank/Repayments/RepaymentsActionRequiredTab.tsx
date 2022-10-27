import {
  Box,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import DeletePaymentModal from "components/Payment/DeletePaymentModal";
import RepaymentsDataGrid, {
  RepaymentTypeEnum,
} from "components/Repayment/RepaymentsDataGrid";
import ScheduleRepaymentModal from "components/Repayment/ScheduleRepaymentModal";
import SettleRepaymentModal from "components/Repayment/SettleRepaymentModal";
import UpdateRepaymentBankNoteModal from "components/Repayment/UpdateRepaymentBankNoteModal";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import {
  PaymentLimitedFragment,
  Payments,
  useGetSubmittedPaymentsSubscription,
} from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function BankRepaymentsActionRequiredTab() {
  const classes = useStyles();
  const navigate = useNavigate();

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
  const notScheduledPayments = useMemo(
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

  const [selectedPaymentId, setSelectedPaymentId] = useState(null);

  return (
    <Container>
      <Box className={classes.container}>
        {!!selectedPaymentId && (
          <UpdateRepaymentBankNoteModal
            paymentId={selectedPaymentId}
            handleClose={() => setSelectedPaymentId(null)}
          />
        )}
        <Box
          className={classes.section}
          data-cy="requested-reverse-draft-ach-table-container"
        >
          <Typography variant="h6">Requested Reverse Draft ACHs</Typography>
          <Box mb={2} display="flex" flexDirection="row-reverse">
            <Can perform={Action.SettleRepayment}>
              <Box>
                <ModalButton
                  isDisabled={selectedSchedulePaymentIds.length !== 1}
                  label={"Submit Repayment"}
                  modal={({ handleClose }) => (
                    <ScheduleRepaymentModal
                      paymentId={selectedSchedulePaymentIds[0]}
                      handleClose={() => {
                        handleClose();
                        setSelectedSchedulePaymentIds([]);
                      }}
                    />
                  )}
                />
              </Box>
            </Can>
            {selectedSchedulePaymentIds.length === 1 && (
              <Can perform={Action.DeleteRepayments}>
                <Box mr={2}>
                  <ModalButton
                    label={"Delete Repayment"}
                    variant={"outlined"}
                    modal={({ handleClose }) => (
                      <DeletePaymentModal
                        paymentId={selectedSchedulePaymentIds[0]}
                        handleClose={() => {
                          handleClose();
                          setSelectedSchedulePaymentIds([]);
                        }}
                      />
                    )}
                  />
                </Box>
              </Can>
            )}
          </Box>
          <RepaymentsDataGrid
            isCompanyVisible
            isMultiSelectEnabled
            repaymentType={RepaymentTypeEnum.RequestedReverseDraftACH}
            payments={notScheduledPayments}
            selectedPaymentIds={selectedSchedulePaymentIds}
            handleClickCustomer={(customerId) =>
              navigate(
                getBankCompanyRoute(customerId, BankCompanyRouteEnum.Overview)
              )
            }
            handleClickPaymentBankNote={(repaymentId) =>
              setSelectedPaymentId(repaymentId)
            }
            handleSelectPayments={handleSelectSchedulePayments}
          />
        </Box>
        <Box className={classes.sectionSpace} />
        <Box
          className={classes.section}
          data-cy="submitted-reverse-draft-ach-table-container"
        >
          <Typography variant="h6">Submitted Reverse Draft ACHs</Typography>
          <Box mb={2} display="flex" flexDirection="row-reverse">
            <Can perform={Action.SettleRepayment}>
              <Box>
                <ModalButton
                  isDisabled={selectedSettlePaymentIds.length !== 1}
                  label={"Settle Repayment"}
                  modal={({ handleClose }) => (
                    <SettleRepaymentModal
                      paymentId={selectedSettlePaymentIds[0]}
                      handleClose={() => {
                        handleClose();
                        setSelectedSettlePaymentIds([]);
                      }}
                    />
                  )}
                />
              </Box>
            </Can>
            {selectedSettlePaymentIds.length === 1 && (
              <Can perform={Action.DeleteRepayments}>
                <Box mr={2}>
                  <ModalButton
                    label={"Delete Repayment"}
                    variant={"outlined"}
                    modal={({ handleClose }) => (
                      <DeletePaymentModal
                        paymentId={selectedSettlePaymentIds[0]}
                        handleClose={() => {
                          handleClose();
                          setSelectedSettlePaymentIds([]);
                        }}
                      />
                    )}
                  />
                </Box>
              </Can>
            )}
          </Box>
          <RepaymentsDataGrid
            isCompanyVisible
            isMultiSelectEnabled
            repaymentType={RepaymentTypeEnum.ReverseDraftACH}
            payments={pendingReverseDraftPayments}
            selectedPaymentIds={selectedSettlePaymentIds}
            handleClickCustomer={(customerId) =>
              navigate(
                getBankCompanyRoute(customerId, BankCompanyRouteEnum.Overview)
              )
            }
            handleClickPaymentBankNote={(repaymentId) =>
              setSelectedPaymentId(repaymentId)
            }
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
                  label={"Settle Repayment"}
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
            {selectedNotifyPaymentIds.length === 1 && (
              <Can perform={Action.DeleteRepayments}>
                <Box mr={2}>
                  <ModalButton
                    label={"Delete Repayment"}
                    variant={"outlined"}
                    modal={({ handleClose }) => (
                      <DeletePaymentModal
                        paymentId={selectedNotifyPaymentIds[0]}
                        handleClose={() => {
                          handleClose();
                          setSelectedNotifyPaymentIds([]);
                        }}
                      />
                    )}
                  />
                </Box>
              </Can>
            )}
          </Box>
          <RepaymentsDataGrid
            isCompanyVisible
            isMultiSelectEnabled
            repaymentType={RepaymentTypeEnum.Other}
            payments={notifyPayments}
            selectedPaymentIds={selectedNotifyPaymentIds}
            handleClickCustomer={(customerId) =>
              navigate(
                getBankCompanyRoute(customerId, BankCompanyRouteEnum.Overview)
              )
            }
            handleClickPaymentBankNote={(repaymentId) =>
              setSelectedPaymentId(repaymentId)
            }
            handleSelectPayments={handleSelectNotifyPayments}
          />
        </Box>
      </Box>
    </Container>
  );
}
