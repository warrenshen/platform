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
import { formatDateString } from "lib/date";
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
              Requested Payment Date
            </Typography>
            <Typography variant={"body1"}>
              {formatDateString(payment.requested_payment_date)}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Payment Date
            </Typography>
            <Typography variant={"body1"}>
              {formatDateString(payment.payment_date)}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Settlement Date
            </Typography>
            <Typography variant={"body1"}>
              {formatDateString(payment.settlement_date)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  ) : null;
}

export default PaymentDrawer;
