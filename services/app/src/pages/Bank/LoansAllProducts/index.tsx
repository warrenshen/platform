import { Box } from "@material-ui/core";
import BankLoansDataGrid from "components/Shared/DataGrid/BankLoansDataGrid";
import Page from "components/Shared/Page";
import { useLoansForBankQuery } from "generated/graphql";

function LoansAllProductsPage() {
  const { data, error } = useLoansForBankQuery();

  if (error) {
    alert("Error querying loans. " + error);
  }

  const loans = data?.loans || [];

  return (
    <Page appBarTitle={"Loans All Products"}>
      <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
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
