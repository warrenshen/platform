import { Box } from "@material-ui/core";
import BankLoansDataGrid from "components/Shared/DataGrid/BankLoansDataGrid";
import Page from "components/Shared/Page";
import { useLoansForBankQuery } from "generated/graphql";
import useAppBarTitle from "hooks/useAppBarTitle";
import { useTitle } from "react-use";

function LoansAllProductsPage() {
  useTitle("Loans All Products | Bespoke");
  useAppBarTitle("Loans All Products");

  const { data, error } = useLoansForBankQuery();

  if (error) {
    alert("Error querying loans. " + error);
  }

  const loans = data?.loans || [];

  return (
    <Page>
      <Box style={{ height: "80vh", width: "100%" }}>
        <BankLoansDataGrid
          fullView
          loansPastDue={false}
          loans={loans}
        ></BankLoansDataGrid>
      </Box>
    </Page>
  );
}

export default LoansAllProductsPage;
