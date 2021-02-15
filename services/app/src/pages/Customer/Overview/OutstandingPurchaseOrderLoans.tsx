import { Box, Button } from "@material-ui/core";
import PayOffLoansModal from "components/Loans/PayOffLoansModal";
import PurchaseOrderLoansDataGrid from "components/Loans/PurchaseOrder/PurchaseOrderLoansDataGrid";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  LoanTypeEnum,
  useGetOutstandingLoansForCustomerQuery,
} from "generated/graphql";
import { useContext, useState } from "react";

function OutstandingPurchaseOrderLoans() {
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  const { data, error, refetch } = useGetOutstandingLoansForCustomerQuery({
    variables: {
      companyId,
      loanType: LoanTypeEnum.PurchaseOrder,
    },
  });

  if (error) {
    alert("Error querying purchase order loans. " + error);
  }

  const purchaseOrderLoans = data?.loans || [];

  const [isPayOffLoansModalOpen, setIsPayOffLoansModalOpen] = useState(false);

  return (
    <Box display="flex" flexDirection="column" width="100%">
      {isPayOffLoansModalOpen && (
        <PayOffLoansModal
          handleClose={() => {
            refetch();
            setIsPayOffLoansModalOpen(false);
          }}
        />
      )}
      <Box display="flex" flexDirection="row-reverse" mb={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsPayOffLoansModalOpen(true)}
        >
          Pay Off Loan(s)
        </Button>
      </Box>
      <Box display="flex" flex={1}>
        <PurchaseOrderLoansDataGrid purchaseOrderLoans={purchaseOrderLoans} />
      </Box>
    </Box>
  );
}

export default OutstandingPurchaseOrderLoans;
