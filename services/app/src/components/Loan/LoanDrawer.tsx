import {
  Box,
  createStyles,
  Drawer,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import PurchaseOrderInfoCard from "components/PurchaseOrder/PurchaseOrderInfoCard";
import LoanStatusChip from "components/Shared/Chip/LoanStatusChip";
import TransactionsDataGrid from "components/Transactions/TransactionsDataGrid";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  Loans,
  LoanTypeEnum,
  useGetLoanWithArtifactForCustomerQuery,
  useGetTransactionsForLoanQuery,
  UserRolesEnum,
} from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { formatDateString } from "lib/date";
import { LoanTypeToLabel } from "lib/enum";
import { createLoanPublicIdentifier } from "lib/loans";
import { useContext } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawerContent: {
      width: 400,
      paddingBottom: theme.spacing(16),
    },
  })
);

interface Props {
  loanId: Loans["id"];
  handleClose: () => void;
}

function LoanDrawer({ loanId, handleClose }: Props) {
  const classes = useStyles();
  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const isBankUser = role === UserRolesEnum.BankAdmin;

  const { data } = useGetLoanWithArtifactForCustomerQuery({
    variables: {
      id: loanId,
    },
  });

  const loan = data?.loans_by_pk;

  const response = useGetTransactionsForLoanQuery({
    variables: {
      loan_id: loanId,
    },
  });

  const transactions = response.data?.transactions;

  return loan ? (
    <Drawer open anchor="right" onClose={handleClose}>
      <Box className={classes.drawerContent} p={4}>
        <Typography variant="h5">Loan</Typography>
        <Box display="flex" flexDirection="column" mt={2}>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            mt={2}
          >
            <Typography variant="subtitle2" color="textSecondary">
              Identifier
            </Typography>
            <Typography variant={"body1"}>
              {createLoanPublicIdentifier(loan)}
            </Typography>
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            mt={2}
          >
            <Typography variant="subtitle2" color="textSecondary">
              Status
            </Typography>
            <LoanStatusChip loanStatus={loan.status} />
          </Box>
          {isBankUser && (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              mt={2}
            >
              <Typography variant="subtitle2" color="textSecondary">
                Loan Type
              </Typography>
              <Typography variant={"body1"}>
                {loan.loan_type
                  ? LoanTypeToLabel[loan.loan_type]
                  : "Invalid Loan Type"}
              </Typography>
            </Box>
          )}
          {isBankUser && (
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Company
              </Typography>
              <Typography variant={"body1"}>{loan.company?.name}</Typography>
            </Box>
          )}
          {loan.loan_type === LoanTypeEnum.LineOfCredit && (
            <>
              <Box display="flex" flexDirection="column" mt={2}>
                <Typography variant="subtitle2" color="textSecondary">
                  Is Credit For Vendor?
                </Typography>
                <Typography variant={"body1"}>
                  {loan.line_of_credit?.is_credit_for_vendor ? "Yes" : "No"}
                </Typography>
              </Box>
              <Box display="flex" flexDirection="column" mt={2}>
                <Typography variant="subtitle2" color="textSecondary">
                  Recipient Vendor
                </Typography>
                <Typography variant={"body1"}>
                  {loan.line_of_credit?.recipient_vendor?.name}
                </Typography>
              </Box>
            </>
          )}
          {loan.loan_type === LoanTypeEnum.PurchaseOrder && (
            <>
              <Box display="flex" flexDirection="column" mt={2}>
                <Typography variant="subtitle2" color="textSecondary">
                  Purchase Order
                </Typography>
                {loan.purchase_order ? (
                  <Box mt={1}>
                    <PurchaseOrderInfoCard
                      purchaseOrder={loan.purchase_order}
                    />
                  </Box>
                ) : (
                  <Typography variant="body1">Not found</Typography>
                )}
              </Box>
            </>
          )}
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Amount
            </Typography>
            <Typography variant={"body1"}>
              {formatCurrency(loan.amount)}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Requested Payment Date
            </Typography>
            <Typography variant={"body1"}>
              {formatDateString(loan.requested_payment_date)}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Payment Date
            </Typography>
            <Typography variant={"body1"}>
              {formatDateString(loan.origination_date)}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Maturity Date
            </Typography>
            <Typography variant={"body1"}>
              {formatDateString(loan.maturity_date)}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Outstanding Principal Balance
            </Typography>
            <Typography variant={"body1"}>
              {formatCurrency(loan.outstanding_principal_balance)}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Outstanding Interest
            </Typography>
            <Typography variant={"body1"}>
              {formatCurrency(loan.outstanding_interest)}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Outstanding Fees
            </Typography>
            <Typography variant={"body1"}>
              {formatCurrency(loan.outstanding_fees)}
            </Typography>
          </Box>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          mt={2}
        >
          <Typography variant="subtitle2" color="textSecondary">
            Platform ID
          </Typography>
          <Typography variant={"body1"}>{loan.id}</Typography>
        </Box>
        {transactions && isBankUser && (
          <Box mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Transactions
            </Typography>
            <Box
              flex={1}
              display="flex"
              flexDirection="column"
              overflow="scroll"
            >
              <TransactionsDataGrid
                transactions={transactions}
                isMiniTable={true}
              />
            </Box>
          </Box>
        )}
      </Box>
    </Drawer>
  ) : null;
}

export default LoanDrawer;
