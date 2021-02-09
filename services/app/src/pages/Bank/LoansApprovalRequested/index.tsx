import { Box } from "@material-ui/core";
import BankLoansDataGrid from "components/Shared/DataGrid/BankLoansDataGrid";
import Page from "components/Shared/Page";
import {
  LoanStatusEnum,
  useLoansByStatusForBankQuery,
  useUpdateLoanMutation,
} from "generated/graphql";
import useAppBarTitle from "hooks/useAppBarTitle";
import { useTitle } from "react-use";
function LoansAllProductsPage() {
  useTitle("Loans Approval Requested | Bespoke");
  useAppBarTitle("Loans Approval Requested");

  const {
    data,
    error,
    loading: isLoansLoading,
    refetch,
  } = useLoansByStatusForBankQuery({
    variables: {
      status: LoanStatusEnum.ApprovalRequested,
    },
  });

  if (error) {
    alert("Error querying loans. " + error);
  }

  const [
    updateLoan,
    { loading: isUpdateLoanLoading },
  ] = useUpdateLoanMutation();

  const handleApproveLoan = async (loanId: string) => {
    // TODO (warrenshen): do we need a Loans.approved_at?
    const response = await updateLoan({
      variables: {
        id: loanId,
        loan: {
          status: LoanStatusEnum.Approved,
        },
      },
    });
    const savedLoan = response.data?.update_loans_by_pk;
    if (!savedLoan) {
      alert("Could not approve loan");
    }
    refetch();
  };

  const handleRejectLoan = async (loanId: string) => {
    // TODO (Warren): what to do about Loans.reject_by_user_id and Loans.rejection_notes?
    const response = await updateLoan({
      variables: {
        id: loanId,
        loan: {
          status: LoanStatusEnum.Rejected,
          rejected_at: "now()",
        },
      },
    });
    const savedLoan = response.data?.update_loans_by_pk;
    if (!savedLoan) {
      alert("Could not reject loan");
    }
    refetch();
  };

  const loans = data?.loans || [];

  const isDataReady = isLoansLoading || isUpdateLoanLoading;
  console.log({ isDataReady });

  return (
    <Page>
      <Box style={{ height: "80vh", width: "100%" }}>
        <BankLoansDataGrid
          fullView
          loansPastDue={false}
          loans={loans}
          actionItems={[
            // {
            //   key: "view-loan",
            //   label: "View",
            //   handleClick: (params) =>
            //     handleViewLoan(params.row.data.id as string),
            // },
            // {
            //   key: "edit-loan-notes",
            //   label: "Edit Internal Note",
            //   handleClick: (params) =>
            //     handleEditLoanNotes(params.row.data.id as string),
            // },
            {
              key: "approve-loan",
              label: "Approve Loan",
              handleClick: (params) =>
                handleApproveLoan(params.row.data.id as string),
            },
            {
              key: "reject-loan",
              label: "Reject Loan",
              handleClick: (params) =>
                handleRejectLoan(params.row.data.id as string),
            },
          ]}
        ></BankLoansDataGrid>
      </Box>
    </Page>
  );
}

export default LoansAllProductsPage;
