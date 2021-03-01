import { Box } from "@material-ui/core";
import PurchaseOrdersDataGrid from "components/PurchaseOrders/PurchaseOrdersDataGrid";
import { usePurchaseOrdersByCompanyIdQuery } from "generated/graphql";

interface Props {
  companyId: string;
}

function BankCustomerPurchaseOrdersSubpage({ companyId }: Props) {
  const { data, error } = usePurchaseOrdersByCompanyIdQuery({
    variables: {
      company_id: companyId,
    },
  });

  if (error) {
    window.console.log("Error querying purchase orders. Error: " + error);
  }

  const purchaseOrders = data?.purchase_orders || [];

  return (
    <Box flex={1} display="flex" flexDirection="column" width="100%">
      <PurchaseOrdersDataGrid
        isCompanyVisible={false}
        purchaseOrders={purchaseOrders}
      />
    </Box>
  );
}

export default BankCustomerPurchaseOrdersSubpage;
