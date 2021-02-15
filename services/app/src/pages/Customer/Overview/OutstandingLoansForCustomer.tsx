import { Box, Button } from "@material-ui/core";
import LineOfCreditLoansDataGrid from "components/Loans/LineOfCredit/LineOfCreditLoansDataGrid";
import PurchaseOrderLoansDataGrid from "components/Loans/PurchaseOrder/PurchaseOrderLoansDataGrid";
import CreateRepaymentModal from "components/Shared/Payments/Repayment/CreateRepaymentModal";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  LoanFragment,
  Loans,
  LoanTypeEnum,
  ProductTypeEnum,
  useGetOutstandingLoansForCustomerQuery,
} from "generated/graphql";
import { useContext, useState } from "react";

function OutstandingLoansForCustomer() {
  const {
    user: { companyId, productType },
  } = useContext(CurrentUserContext);

  const { data, error, refetch } = useGetOutstandingLoansForCustomerQuery({
    variables: {
      companyId,
      loanType:
        productType === ProductTypeEnum.LineOfCredit
          ? LoanTypeEnum.LineOfCredit
          : LoanTypeEnum.PurchaseOrder,
    },
  });

  if (error) {
    alert("Error querying loans. " + error);
  }

  const loans = data?.loans || [];

  const [isCreateRepaymentModalOpen, setIsCreateRepaymentModalOpen] = useState(
    false
  );
  const [selectedLoans, setSelectedLoans] = useState<LoanFragment[]>([]);
  const [selectedLoanIds, setSelectedLoanIds] = useState<Loans["id"]>([]);

  return (
    <Box display="flex" flexDirection="column" width="100%">
      {isCreateRepaymentModalOpen && (
        <CreateRepaymentModal
          companyId={companyId}
          selectedLoans={selectedLoans}
          handleClose={() => {
            refetch();
            setSelectedLoans([]);
            setSelectedLoanIds([]);
            setIsCreateRepaymentModalOpen(false);
          }}
        />
      )}
      <Box display="flex" flexDirection="row-reverse" mb={2}>
        <Button
          disabled={selectedLoanIds.length <= 0}
          variant="contained"
          color="primary"
          onClick={() => setIsCreateRepaymentModalOpen(true)}
        >
          Pay Off Loan(s)
        </Button>
      </Box>
      <Box display="flex" flex={1}>
        {productType === ProductTypeEnum.InventoryFinancing ? (
          <PurchaseOrderLoansDataGrid
            loans={loans}
            selectedLoanIds={selectedLoanIds}
            handleSelectLoans={(loans) => {
              setSelectedLoans(loans);
              setSelectedLoanIds(loans.map((loan) => loan.id));
            }}
          />
        ) : (
          <LineOfCreditLoansDataGrid
            loans={loans}
            selectedLoanIds={selectedLoanIds}
            handleSelectLoans={(loans) => {
              setSelectedLoans(loans);
              setSelectedLoanIds(loans.map((loan) => loan.id));
            }}
          />
        )}
      </Box>
    </Box>
  );
}

export default OutstandingLoansForCustomer;
