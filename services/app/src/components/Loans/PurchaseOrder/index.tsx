import { Box, Button } from "@material-ui/core";
import CreateRepaymentModal from "components/Repayment/CreateRepaymentModal";
import Can from "components/Shared/Can";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  LoanFragment,
  Loans,
  LoanTypeEnum,
  useLoansByCompanyAndLoanTypeForCustomerQuery,
} from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { ActionType } from "lib/enum";
import { getLoanNameByProductType } from "lib/finance/loans/loans";
import { useContext, useState } from "react";
import CreateUpdatePurchaseOrderLoanModal from "./CreateUpdatePurchaseOrderLoanModal";
import PurchaseOrderLoansDataGrid from "./PurchaseOrderLoansDataGrid";

function PurchaseOrderLoansForCustomer() {
  const {
    user: { companyId, productType },
  } = useContext(CurrentUserContext);

  const { data, error, refetch } = useLoansByCompanyAndLoanTypeForCustomerQuery(
    {
      variables: {
        companyId,
        loanType: LoanTypeEnum.PurchaseOrder,
      },
    }
  );

  if (error) {
    alert("Error querying purchase orders. " + error);
  }

  const purchaseOrderLoans = data?.loans || [];
  // State for modal(s).
  const [isCreateUpdateModalOpen, setIsCreateUpdateModalOpen] = useState(false);
  const [isPayOffLoansModalOpen, setIsPayOffLoansModalOpen] = useState(false);
  const [targetLoanId, setTargetLoanId] = useState("");
  const [selectedLoans, setSelectedLoans] = useState<LoanFragment[]>([]);
  const [selectedLoanIds, setSelectedLoanIds] = useState<Loans["id"][]>([]);

  const handleEditPurchaseOrderLoan = (loanId: string) => {
    setTargetLoanId(loanId);
    setIsCreateUpdateModalOpen(true);
  };

  return (
    <Box>
      {isCreateUpdateModalOpen && (
        <CreateUpdatePurchaseOrderLoanModal
          actionType={targetLoanId === "" ? ActionType.New : ActionType.Update}
          loanId={targetLoanId}
          artifactId={null}
          handleClose={() => {
            refetch();
            setIsCreateUpdateModalOpen(false);
            setTargetLoanId("");
          }}
        />
      )}
      {isPayOffLoansModalOpen && (
        <CreateRepaymentModal
          companyId={companyId}
          productType={productType}
          selectedLoans={selectedLoans}
          handleClose={() => setIsPayOffLoansModalOpen(false)}
        />
      )}
      <Box display="flex" flexDirection="row-reverse" mb={2}>
        <Can perform={Action.AddPurchaseOrders}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsCreateUpdateModalOpen(true)}
          >
            Create Loan
          </Button>
        </Can>
        <Can perform={Action.RepayPurchaseOrderLoans}>
          <Box mr={2}>
            <Button
              disabled={selectedLoans.length <= 0}
              variant="contained"
              color="primary"
              onClick={() => setIsPayOffLoansModalOpen(true)}
            >
              {`Pay Off ${getLoanNameByProductType(productType)}(s)`}
            </Button>
          </Box>
        </Can>
      </Box>
      <Box display="flex" flex={1}>
        <PurchaseOrderLoansDataGrid
          loans={purchaseOrderLoans}
          selectedLoanIds={selectedLoanIds}
          actionItems={[
            {
              key: "edit-purchase-order-loan",
              label: "Edit",
              handleClick: (params) =>
                handleEditPurchaseOrderLoan(params.row.data.id as string),
            },
          ]}
          handleSelectLoans={(loans) => {
            setSelectedLoans(loans);
            setSelectedLoanIds(loans.map((loan) => loan.id));
          }}
        />
      </Box>
    </Box>
  );
}

export default PurchaseOrderLoansForCustomer;
