import { Box } from "@material-ui/core";
import PurchaseOrdersDataGrid from "components/PurchaseOrders/PurchaseOrdersDataGrid";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useGetPurchaseOrdersSubscription } from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { useContext } from "react";

function BankPurchaseOrdersAllTab() {
  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const { data, error } = useGetPurchaseOrdersSubscription();

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
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

export default BankPurchaseOrdersAllTab;
