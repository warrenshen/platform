import {
  Box,
  createStyles,
  Drawer,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import UpdateLoanNotesModal from "components/Loans/UpdateLoanNotesModal";
import PurchaseOrderInfoCard from "components/PurchaseOrder/PurchaseOrderInfoCard";
import LoanStatusChip from "components/Shared/Chip/LoanStatusChip";
import ModalButton from "components/Shared/Modal/ModalButton";
import TransactionsDataGrid from "components/Transactions/TransactionsDataGrid";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  Loans,
  LoanStatusEnum,
  LoanTypeEnum,
  useGetLoanWithArtifactForBankQuery,
  useGetLoanWithArtifactForCustomerQuery,
  useGetTransactionsForLoanQuery,
  UserRolesEnum,
} from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { formatDateString } from "lib/date";
import { LoanTypeToLabel } from "lib/enum";
import {
  createLoanCustomerIdentifier,
  createLoanDisbursementIdentifier,
} from "lib/loans";
import { useContext } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawerContent: {
      width: 800,
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

  const {
    data: bankData,
    refetch: bankRefetch,
    error: bankError,
  } = useGetLoanWithArtifactForBankQuery({
    skip: !isBankUser,
    variables: {
      id: loanId,
    },
  });

  const {
    data: customerData,
    refetch: customerRefetch,
    error: customerError,
  } = useGetLoanWithArtifactForCustomerQuery({
    skip: isBankUser,
    variables: {
      id: loanId,
    },
  });

  const {
    data: transactionsData,
    error: transactionsError,
  } = useGetTransactionsForLoanQuery({
    skip: !isBankUser,
    variables: {
      loan_id: loanId,
    },
  });

  if (bankError || customerError || transactionsError) {
    alert(
      `Error loading loan: ${bankError || customerError || transactionsError}`
    );
  }

  const refetch = isBankUser ? bankRefetch : customerRefetch;

  const loan = isBankUser ? bankData?.loans_by_pk : customerData?.loans_by_pk;
  const bankLoan = bankData?.loans_by_pk;
  const transactions = transactionsData?.transactions;

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
              {createLoanCustomerIdentifier(loan)}
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
                Disbursement Identifier
              </Typography>
              <Typography variant={"body1"}>
                {createLoanDisbursementIdentifier(loan)}
              </Typography>
            </Box>
          )}
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
          {loan.status === LoanStatusEnum.Rejected && (
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Rejection Reason
              </Typography>
              <Typography variant={"body1"}>{loan.rejection_note}</Typography>
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
                  {loan.line_of_credit?.is_credit_for_vendor
                    ? loan.line_of_credit?.recipient_vendor?.name
                    : "N/A"}
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
              Origination Date
            </Typography>
            <Typography variant={"body1"}>
              {loan.origination_date
                ? formatDateString(loan.origination_date)
                : "-"}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Maturity Date
            </Typography>
            <Typography variant={"body1"}>
              {loan.maturity_date ? formatDateString(loan.maturity_date) : "-"}
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
              Outstanding Late Fees
            </Typography>
            <Typography variant={"body1"}>
              {formatCurrency(loan.outstanding_fees)}
            </Typography>
          </Box>
        </Box>
        {isBankUser && (
          <>
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Internal Notes
              </Typography>
              <Typography variant={"body1"}>
                {bankLoan?.notes || "-"}
              </Typography>
            </Box>
            <Box mt={1}>
              <ModalButton
                label={"Edit Internal Notes"}
                color={"default"}
                size={"small"}
                variant={"outlined"}
                modal={({ handleClose }) => (
                  <UpdateLoanNotesModal
                    loanId={loanId}
                    handleClose={() => {
                      refetch();
                      handleClose();
                    }}
                  />
                )}
              />
            </Box>
          </>
        )}
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
        {isBankUser && transactions && (
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
              <TransactionsDataGrid isMiniTable transactions={transactions} />
            </Box>
          </Box>
        )}
      </Box>
    </Drawer>
  ) : null;
}

export default LoanDrawer;
