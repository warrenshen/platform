import {
  Box,
  createStyles,
  Drawer,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import ReverseRepaymentModal from "components/Payment/ReverseRepaymentModal";
import PaymentStatusChip from "components/Shared/Chip/PaymentStatusChip";
import ModalButton from "components/Shared/Modal/ModalButton";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import { Payments, useGetPaymentQuery } from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { formatDateString, formatDatetimeString } from "lib/date";
import { PaymentMethodEnum, PaymentMethodToLabel } from "lib/enum";
import { getPaymentStatus } from "lib/finance/payments/repayment";
import { useContext } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawerContent: {
      width: 500,
      paddingBottom: theme.spacing(16),
    },
    propertyLabel: {
      flexGrow: 1,
    },
  })
);

interface Props {
  paymentId: Payments["id"];
  handleClose: () => void;
}

export default function PaymentDrawer({ paymentId, handleClose }: Props) {
  const classes = useStyles();

  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

  const { data, refetch } = useGetPaymentQuery({
    variables: {
      id: paymentId,
    },
  });

  const payment = data?.payments_by_pk;

  if (!payment) {
    return null;
  }

  return (
    <Drawer open anchor="right" onClose={handleClose}>
      <Box className={classes.drawerContent} p={4}>
        <Typography variant="h5">Payment</Typography>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          mt={2}
        >
          <Typography variant="subtitle2" color="textSecondary">
            Status
          </Typography>
          <PaymentStatusChip paymentStatus={getPaymentStatus(payment)} />
        </Box>
        {isBankUser && (
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Customer
            </Typography>
            <Typography variant={"body1"}>{payment.company?.name}</Typography>
          </Box>
        )}
        {isBankUser && (
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Type
            </Typography>
            <Typography variant={"body1"}>{payment.type}</Typography>
          </Box>
        )}
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Method
          </Typography>
          <Typography variant={"body1"}>
            {PaymentMethodToLabel[payment.method as PaymentMethodEnum]}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Amount
          </Typography>
          <Typography variant={"body1"}>
            {formatCurrency(payment.amount)}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Requested Deposit Date
          </Typography>
          <Typography variant={"body1"}>
            {payment.requested_payment_date
              ? formatDateString(payment.requested_payment_date)
              : "-"}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Payment Date
          </Typography>
          <Typography variant={"body1"}>
            {payment.payment_date
              ? formatDateString(payment.payment_date)
              : "TBD"}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Deposit Date
          </Typography>
          <Typography variant={"body1"}>
            {payment.deposit_date
              ? formatDateString(payment.deposit_date)
              : "TBD"}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Settlement Date
          </Typography>
          <Typography variant={"body1"}>
            {payment.settlement_date
              ? formatDateString(payment.settlement_date)
              : !!payment.reversed_at
              ? "-"
              : "TBD"}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Settlement By
          </Typography>
          <Typography variant={"body1"}>
            {payment.settled_by_user?.full_name || "-"}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Submitted Datetime
          </Typography>
          <Typography variant={"body1"}>
            {formatDatetimeString(payment.submitted_at)}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Submitted By
          </Typography>
          <Typography variant={"body1"}>
            {payment.submitted_by_user?.full_name || "-"}
          </Typography>
        </Box>
        {isBankUser && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            mt={2}
          >
            <Typography variant="subtitle2" color="textSecondary">
              Platform ID
            </Typography>
            <Typography variant={"body1"}>{payment.id}</Typography>
          </Box>
        )}
        {isBankUser && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            mt={2}
          >
            <Typography variant="subtitle2" color="textSecondary">
              Actions
            </Typography>
            <Box mt={1}>
              <ModalButton
                isDisabled={!!payment.reversed_at}
                label={"Reverse Payment"}
                color={"default"}
                modal={({ handleClose }) => (
                  <ReverseRepaymentModal
                    paymentId={payment.id}
                    handleClose={() => {
                      refetch();
                      handleClose();
                    }}
                  />
                )}
              />
            </Box>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
