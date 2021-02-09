import { Box } from "@material-ui/core";
import BankLoansDataGrid from "components/Shared/DataGrid/BankLoansDataGrid";
import Page from "components/Shared/Page";
import {
  LoanFragment,
  LoanStatusEnum,
  useLoansByStatusesForBankQuery,
} from "generated/graphql";
import useAppBarTitle from "hooks/useAppBarTitle";
import { useTitle } from "react-use";

function LoansPastDuePage() {
  useTitle("Loans Past Due | Bespoke");
  useAppBarTitle("Loans Past Due");

  const { data, error } = useLoansByStatusesForBankQuery({
    variables: {
      statuses: [LoanStatusEnum.PastDue],
    },
  });

  if (error) {
    alert("Error querying purchase order loans. " + error);
  }

  const purchaseOrderLoans = (data?.loans || []) as LoanFragment[];

  return (
    <Page>
      <Box style={{ height: "80vh", width: "100%" }}>
        <BankLoansDataGrid
          loans={purchaseOrderLoans}
          fullView={true}
          loansPastDue={true}
        ></BankLoansDataGrid>
      </Box>
    </Page>
  );
}

export default LoansPastDuePage;
