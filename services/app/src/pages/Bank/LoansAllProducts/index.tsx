import { Box } from "@material-ui/core";
import BankLoansDataGrid from "components/Loans/BankLoansDataGrid";
import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useLoansForBankQuery } from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { useContext } from "react";

function LoansAllProductsPage() {
  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const { data, error } = useLoansForBankQuery();

  if (error) {
    alert("Error querying loans. " + error);
  }

  const loans = data?.loans || [];

  return (
    <Page appBarTitle={"Loans All Products"}>
      <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
        <BankLoansDataGrid
          isMaturityVisible
          fullView
          loansPastDue={false}
          loans={loans}
          isMultiSelectEnabled={check(role, Action.SelectLoan)}
        />
      </Box>
    </Page>
  );
}

export default LoansAllProductsPage;
