import { Box } from "@material-ui/core";
import BankLoansDataGrid from "components/Loans/BankLoansDataGrid";
import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";

import {
  LoanFragment,
  LoanStatusEnum,
  useLoansByStatusesForBankQuery,
} from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { useContext } from "react";

function LoansPastDuePage() {
  const {
    user: { role },
  } = useContext(CurrentUserContext);
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
    <Page appBarTitle={"Loans Past Due"}>
      <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
        <BankLoansDataGrid
          isMaturityVisible
          loans={purchaseOrderLoans}
          fullView={true}
          loansPastDue={true}
          isMultiSelectEnabled={check(role, Action.SelectLoan)}
        />
      </Box>
    </Page>
  );
}

export default LoansPastDuePage;
