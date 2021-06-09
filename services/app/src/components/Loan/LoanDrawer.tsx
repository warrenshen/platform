import { Box, Typography } from "@material-ui/core";
import InvoiceInfoCard from "components/Invoices/InvoiceInfoCard";
import UpdateLoanNotesModal from "components/Loan/UpdateLoanNotesModal";
import PurchaseOrderInfoCard from "components/PurchaseOrder/PurchaseOrderInfoCard";
import LoanPaymentStatusChip from "components/Shared/Chip/LoanPaymentStatusChip";
import LoanStatusChip from "components/Shared/Chip/LoanStatusChip";
import Modal from "components/Shared/Modal/Modal";
import ModalButton from "components/Shared/Modal/ModalButton";
import TransactionsDataGrid from "components/Transactions/TransactionsDataGrid";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import {
  Loans,
  LoanStatusEnum,
  LoanTypeEnum,
  useGetLoanWithArtifactForBankQuery,
  useGetLoanWithArtifactForCustomerQuery,
  useGetTransactionsForLoanQuery,
} from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { formatDateString } from "lib/date";
import { LoanPaymentStatusEnum, LoanTypeToLabel } from "lib/enum";
import {
  createLoanCustomerIdentifier,
  createLoanDisbursementIdentifier,
} from "lib/loans";
import { useContext } from "react";

interface Props {
  loanId: Loans["id"];
  handleClose: () => void;
}

export default function LoanDrawer({ loanId, handleClose }: Props) {
  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

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

  if (!loan) {
    return null;
  }

  const isMaturityVisible = !!loan.origination_date;

  return (
    <Modal
      title={"Loan"}
      subtitle={
        isMaturityVisible
          ? `${createLoanCustomerIdentifier(
              loan
            )} | ${createLoanDisbursementIdentifier(loan)}`
          : createLoanCustomerIdentifier(loan)
      }
      contentWidth={800}
      handleClose={handleClose}
    >
      <Box display="flex" flexDirection="column" alignItems="flex-start" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Identifier
        </Typography>
        <Typography variant={"body1"}>
          {createLoanCustomerIdentifier(loan)}
        </Typography>
      </Box>
      {isMaturityVisible && isBankUser && (
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
      {isMaturityVisible ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          mt={2}
        >
          <Typography variant="subtitle2" color="textSecondary">
            Payment Status
          </Typography>
          <LoanPaymentStatusChip
            paymentStatus={loan.payment_status as LoanPaymentStatusEnum}
          />
        </Box>
      ) : (
        <>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            mt={2}
          >
            <Typography variant="subtitle2" color="textSecondary">
              Approval Status
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
        </>
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
            Customer Name
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
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Comments
            </Typography>
            <Typography variant={"body1"}>
              {loan.line_of_credit?.customer_note || "-"}
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
                <PurchaseOrderInfoCard purchaseOrder={loan.purchase_order} />
              </Box>
            ) : (
              <Typography variant="body1">Not found</Typography>
            )}
          </Box>
        </>
      )}
      {loan.loan_type === LoanTypeEnum.Invoice && (
        <>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Invoice
            </Typography>
            {loan.invoice ? (
              <Box mt={1}>
                <InvoiceInfoCard invoice={loan.invoice} />
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
        <Typography variant={"body1"}>{formatCurrency(loan.amount)}</Typography>
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Requested Payment Date
        </Typography>
        <Typography variant={"body1"}>
          {loan.requested_payment_date
            ? formatDateString(loan.requested_payment_date)
            : "-"}
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
          {loan.adjusted_maturity_date
            ? formatDateString(loan.adjusted_maturity_date)
            : "-"}
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
      {false && isBankUser && (
        <>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Internal Notes
            </Typography>
            <Typography variant={"body1"}>{bankLoan?.notes || "-"}</Typography>
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
      <Box display="flex" flexDirection="column" alignItems="flex-start" mt={2}>
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
          <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
            <TransactionsDataGrid isMiniTable transactions={transactions} />
          </Box>
        </Box>
      )}
    </Modal>
  );
}
