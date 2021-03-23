import {
  Box,
  createStyles,
  Drawer,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { Payments, useGetPaymentQuery, UserRolesEnum } from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { formatDateString, formatDatetimeString } from "lib/date";
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

function PaymentDrawer({ paymentId, handleClose }: Props) {
  const classes = useStyles();
  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const isBankUser = role === UserRolesEnum.BankAdmin;

  const { data } = useGetPaymentQuery({
    variables: {
      id: paymentId,
    },
  });

  const payment = data?.payments_by_pk;
  console.log({ payment });

  return payment ? (
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
            Platform ID
          </Typography>
          <Typography variant={"body1"}>{payment.id}</Typography>
        </Box>
        <Box display="flex" flexDirection="column">
          {isBankUser && (
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Customer
              </Typography>
              <Typography variant={"body1"}>{payment.company?.name}</Typography>
            </Box>
          )}
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Type
            </Typography>
            <Typography variant={"body1"}>{payment.type}</Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Method
            </Typography>
            <Typography variant={"body1"}>{payment.method}</Typography>
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
        </Box>
      </Box>
    </Drawer>
  ) : null;
}

export default PaymentDrawer;
