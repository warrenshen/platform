import { Box, Button } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import Can from "components/Shared/Can";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  LoanTypeEnum,
  useLoansByCompanyAndLoanTypeForCustomerQuery,
} from "generated/graphql";
import { ActionType } from "lib/ActionType";
import { Action } from "lib/auth/rbac-rules";
import { useContext, useState } from "react";
import CreateUpdateLineOfCreditLoanModal from "./CreateUpdateLineOfCreditLoanModal";
import LineOfCreditLoansDataGrid from "./LineOfCreditLoansDataGrid";

function Loans() {
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  const { data, error, refetch } = useLoansByCompanyAndLoanTypeForCustomerQuery(
    {
      variables: {
        companyId,
        loanType: LoanTypeEnum.LineOfCredit,
      },
    }
  );
  if (error) {
    alert("Error querying line of credit loans. " + error);
  }

  const loans = data?.loans || [];

  // State for modal(s).
  const [isCreateUpdateModalOpen, setIsCreateUpdateModalOpen] = useState(false);
  const [targetLoanId, setTargetLoanId] = useState("");

  // const [selectedLoans, setSelectedLoans] = useState<LoanFragment[]>([]);

  return (
    <Box>
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
        <LineOfCreditLoansDataGrid
          loans={loans}
          actionItems={[
            {
              key: "edit-line-of-credit",
              label: "Edit",
              handleClick: (params: ValueFormatterParams) => {
                setTargetLoanId(params.row.data.id as string);
                setIsCreateUpdateModalOpen(true);
              },
            },
          ]}
        ></LineOfCreditLoansDataGrid>
      </Box>
    </Box>
  );
}

export default Loans;
