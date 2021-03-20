import { Box } from "@material-ui/core";
import LoansDataGrid from "components/Loans/LoansDataGrid";
import Page from "components/Shared/Page";
import { useGetLoansForBankSubscription } from "generated/graphql";

function LoansAllProductsPage() {
  const { data, error } = useGetLoansForBankSubscription();

  if (error) {
    alert("Error querying loans. " + error);
  }

  const loans = data?.loans || [];

  return (
    <Page appBarTitle={"Loans All Products"}>
      <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
        <LoansDataGrid
          isExcelExport
          isCompanyVisible
          isFilteringEnabled
          isMaturityVisible
          loans={loans}
        />
      </Box>
    </Page>
  );
}

export default LoansAllProductsPage;
