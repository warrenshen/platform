import { Box } from "@material-ui/core";
import Page from "components/Shared/Page";
import PurchaseOrdersDataGrid from "components/Shared/PurchaseOrders/PurchaseOrdersDataGrid";
import { useGetPurchaseOrdersQuery } from "generated/graphql";

function BankPurchaseOrdersPage() {
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
          actionItems={[]}
        ></PurchaseOrdersDataGrid>
      </Box>
    </Page>
  );
}

export default BankPurchaseOrdersPage;
