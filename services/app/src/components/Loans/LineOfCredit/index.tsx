import { Box, Button } from "@material-ui/core";
import Can from "components/Shared/Can";
import {
  LoanTypeEnum,
  useLoansByCompanyAndLoanTypeForCustomerQuery,
} from "generated/graphql";
import useCompanyContext from "hooks/useCompanyContext";
import { ActionType } from "lib/ActionType";
import { Action } from "lib/auth/rbac-rules";
import { useState } from "react";
import CreateUpdateLineOfCreditLoanModal from "./CreateUpdateLineOfCreditLoanModal";
import LineOfCreditLoansDataGrid from "./LineOfCreditLoansDataGrid";

function Loans() {
  const companyId = useCompanyContext();

  const { data, error, refetch } = useLoansByCompanyAndLoanTypeForCustomerQuery(
    {
      variables: {
        companyId,
        loanType: LoanTypeEnum.LineOfCredit,
      },
    }
  );
  if (error) {
    alert("Error querying purchase orders. " + error);
  }

  const loans = data?.loans || [];
  // State for create / update Purchase Order modal(s).
  const [isCreateUpdateModalOpen, setIsCreateUpdateModalOpen] = useState(false);

  const [targetLoanId, setTargetLoanId] = useState("");

  // const [selectedLoans, setSelectedLoans] = useState<LoanFragment[]>([]);

  return (
    <Box>
      <Box>Line of Credit</Box>
      <Box pb={2} display="flex" flexDirection="row-reverse">
        <Can perform={Action.AddPurchaseOrders}>
          <Button
            onClick={() => setIsCreateUpdateModalOpen(true)}
            variant="contained"
            color="primary"
          >
            Create Drawdown
          </Button>
        </Can>
        {isCreateUpdateModalOpen && (
          <CreateUpdateLineOfCreditLoanModal
            actionType={
              targetLoanId === "" ? ActionType.New : ActionType.Update
            }
            loanId={targetLoanId}
            handleClose={() => {
              setTargetLoanId("");
              refetch();
              setIsCreateUpdateModalOpen(false);
            }}
          ></CreateUpdateLineOfCreditLoanModal>
        )}
      </Box>
      <Box flex={1} display="flex">
        <LineOfCreditLoansDataGrid loans={loans}></LineOfCreditLoansDataGrid>
      </Box>
    </Box>
  );
}

export default Loans;
