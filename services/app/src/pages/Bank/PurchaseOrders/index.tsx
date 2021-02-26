import { Box } from "@material-ui/core";
import PurchaseOrdersDataGrid from "components/PurchaseOrders/PurchaseOrdersDataGrid";
import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useGetPurchaseOrdersQuery } from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { useContext } from "react";

function BankPurchaseOrdersPage() {
  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const { data, error } = useGetPurchaseOrdersQuery();

  if (error) {
    window.console.log("Error querying purchase orders. Error: " + error);
  }

  const purchaseOrders = data?.purchase_orders || [];

  return (
    <Page appBarTitle={"Purchase Orders"}>
      <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
        <PurchaseOrdersDataGrid
          isCompanyVisible
          purchaseOrders={purchaseOrders}
          actionItems={
            check(role, Action.ViewPurchaseOrdersActionMenu) ? [] : []
          }
        ></PurchaseOrdersDataGrid>
      </Box>
    </Page>
  );
}

export default BankPurchaseOrdersPage;
