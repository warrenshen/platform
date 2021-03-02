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
  Payments,
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
  const [selectedPayments, setSelectedPayments] = useState<PaymentFragment[]>(
    []
  );
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<
    Payments["id"][]
  >([]);

  const handleSelectPayments = useMemo(
    () => (payments: PaymentFragment[]) => {
      setSelectedPayments(payments);
      setSelectedPaymentIds(payments.map((payment) => payment.id));
    },
    [setSelectedPayments]
  );

  return (
    <Page appBarTitle={"Payments - Action Required"}>
      <Box className={classes.container}>
        <Typography variant="h6">Payments - Reverse Draft ACH</Typography>
        <Box mb={2} display="flex" flexDirection="row-reverse">
          <Can perform={Action.SettleRepayment}>
            <Box>
              <ModalButton
                isDisabled={selectedPayments.length !== 1}
                label={"Settle Payment"}
                modal={({ handleClose }) => (
                  <SettleRepaymentModal
                    paymentId={selectedPaymentIds[0]}
                    handleClose={() => {
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
          selectedPaymentIds={selectedPayments.map((p) => p.id)}
          handleSelectPayments={handleSelectPayments}
        />
      </Box>
      <Box className={classes.sectionSpace} />
      <Box className={classes.container}>
        <Typography variant="h6">Payments - Notified</Typography>
      </Box>
    </Page>
  );
}

export default BankPaymentsActionRequiredPage;
