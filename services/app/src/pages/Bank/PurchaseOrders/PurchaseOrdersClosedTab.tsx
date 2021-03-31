import { Box } from "@material-ui/core";
import PurchaseOrdersDataGrid from "components/PurchaseOrders/PurchaseOrdersDataGrid";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useGetConfirmedPurchaseOrdersQuery } from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { useContext } from "react";

function BankPurchaseOrdersClosedTab() {
  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const { data, error } = useGetConfirmedPurchaseOrdersQuery();

  if (error) {
    window.console.log("Error querying purchase orders. Error: " + error);
  }

  const purchaseOrders = data?.purchase_orders || [];

  return (
    <Box
      flex={1}
      display="flex"
      flexDirection="column"
      overflow="scroll"
      mt={3}
    >
      <PurchaseOrdersDataGrid
        isCompanyVisible
        isExcelExport
        purchaseOrders={purchaseOrders}
        actionItems={check(role, Action.ViewPurchaseOrdersActionMenu) ? [] : []}
      />
    </Box>
  );
}

export default BankPurchaseOrdersClosedTab;
