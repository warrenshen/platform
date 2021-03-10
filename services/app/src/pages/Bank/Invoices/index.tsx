import { Box } from "@material-ui/core";
import InvoicesDataGrid from "components/Invoices/InvoicesDataGrid";
import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useGetInvoicesQuery } from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { useContext } from "react";

export default function BankInvoicesPage() {
  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const { data, error } = useGetInvoicesQuery();

  if (error) {
    console.error("Error querying invoices. Error:", error);
  }

  const invoices = data?.invoices || [];

  return (
    <Page appBarTitle="Invoices">
      <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
        <InvoicesDataGrid
          isCompanyVisible
          invoices={invoices}
          actionItems={check(role, Action.ViewInvoicesActionMenu) ? [] : []}
        />
      </Box>
    </Page>
  );
}
