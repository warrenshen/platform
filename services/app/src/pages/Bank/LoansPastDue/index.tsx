import { Box } from "@material-ui/core";
import useAppBarTitle from "hooks/useAppBarTitle";
import { useTitle } from "react-use";
import {
  useAllPurchaseOrderLoansForBankQuery,
  LoanFragment,
} from "generated/graphql";
import Page from "components/Shared/Page";
import BankLoansDataGrid from "components/Shared/DataGrid/BankLoansDataGrid";

function LoansPastDuePage() {
  useTitle("Loans Past Due | Bespoke");
  useAppBarTitle("Loans Past Due");

  const { data, error } = useAllPurchaseOrderLoansForBankQuery();

  if (error) {
    alert("Error querying purchase order loans. " + error);
  }

  const purchaseOrderLoans = (data?.loans || []) as LoanFragment[];

  return (
    <Page>
      <Box style={{ height: "80vh", width: "100%" }}>
        <BankLoansDataGrid
          purchaseOrderLoans={purchaseOrderLoans}
          fullView={true}
          loansPastDue={true}
        ></BankLoansDataGrid>
      </Box>
    </Page>
  );
}

export default LoansPastDuePage;
