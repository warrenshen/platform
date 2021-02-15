import { Box, Button } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  LoanTypeEnum,
  useLoansByCompanyAndLoanTypeForCustomerQuery,
} from "generated/graphql";
import { ActionType } from "lib/enum";
import { useContext, useState } from "react";
import CreateUpdateLineOfCreditLoanModal from "./CreateUpdateLineOfCreditLoanModal";
import LineOfCreditLoansDataGrid from "./LineOfCreditLoansDataGrid";

function LineOfCreditLoansForCustomer() {
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
        <Button
          onClick={() => setIsCreateUpdateModalOpen(true)}
          variant="contained"
          color="primary"
        >
          Create Drawdown
        </Button>
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
          />
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
        />
      </Box>
    </Box>
  );
}

export default LineOfCreditLoansForCustomer;
