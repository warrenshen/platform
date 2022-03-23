import {
  Box,
  createStyles,
  Drawer,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import ReverseRepaymentModal from "components/Payment/ReverseRepaymentModal";
import EditRepaymentDatesModal from "components/Payment/EditRepaymentDatesModal";
import PaymentStatusChip from "components/Shared/Chip/PaymentStatusChip";
import ModalButton from "components/Shared/Modal/ModalButton";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import {
  BankAccounts,
  Payments,
  useGetPaymentForSettlementQuery,
} from "generated/graphql";
import { formatCurrency } from "lib/number";
import { formatDateString, formatDatetimeString } from "lib/date";
import { RepaymentMethodEnum, RepaymentMethodToLabel } from "lib/enum";
import { getPaymentStatus } from "lib/finance/payments/repayment";
import { useContext } from "react";
import { todayAsDateStringServer } from "lib/date";
import BankAccountInfoCard from "components/BankAccount/BankAccountInfoCard";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawerContent: {
      width: 500,
      paddingBottom: theme.spacing(16),
    },
  })
);

interface Props {
  paymentId: Payments["id"];
  handleClose: () => void;
  showBankInfo?: boolean;
}

export default function PaymentDrawer({
  paymentId,
  handleClose,
  showBankInfo = false,
}: Props) {
  const classes = useStyles();

  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);
  const { data, refetch } = useGetPaymentForSettlementQuery({
    variables: {
      id: paymentId,
      today: todayAsDateStringServer(),
    },
  });

  const payment = data?.payments_by_pk;

  if (!payment) {
    return null;
  }

  const renderBankAccountInfoCard = () =>
    showBankInfo ? (
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Recipient Bank Information
        </Typography>
        <BankAccountInfoCard
          bankAccount={
            data?.payments_by_pk?.company_bank_account as BankAccounts
          }
        />
      </Box>
    ) : null;

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
            {RepaymentMethodToLabel[payment.method as RepaymentMethodEnum]}
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
        {renderBankAccountInfoCard()}
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
            <Box
              style={{
                marginTop: "10px",
              }}
            >
              <ModalButton
                isDisabled={!!payment.reversed_at}
                label={"Edit Repayment Dates"}
                color={"default"}
                modal={({ handleClose }) => (
                  <EditRepaymentDatesModal
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
