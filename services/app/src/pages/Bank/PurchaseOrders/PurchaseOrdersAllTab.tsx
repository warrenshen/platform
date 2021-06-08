import { Box, TextField } from "@material-ui/core";
import PurchaseOrdersDataGrid from "components/PurchaseOrder/PurchaseOrdersDataGrid";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useGetPurchaseOrdersSubscription } from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { filter } from "lodash";
import { useContext, useMemo, useState } from "react";

export default function BankPurchaseOrdersAllTab() {
  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const { data, error } = useGetPurchaseOrdersSubscription();

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const [searchQuery, setSearchQuery] = useState("");

  const purchaseOrders = useMemo(() => {
    const filteredPurchaseOrders = filter(
      data?.purchase_orders || [],
      (purchaseOrder) =>
        `${purchaseOrder.company.name} ${purchaseOrder.order_number}`
          .toLowerCase()
          .indexOf(searchQuery.toLowerCase()) >= 0
    );
    return filteredPurchaseOrders;
  }, [searchQuery, data?.purchase_orders]);

  return (
    <Box mt={3}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-end"
        mb={2}
      >
        <Box display="flex">
          <TextField
            autoFocus
            label="Search by PO number or customer name"
            value={searchQuery}
            onChange={({ target: { value } }) => setSearchQuery(value)}
            style={{ width: 400 }}
          />
        </Box>
      </Box>
      <Box display="flex" flexDirection="column">
        <PurchaseOrdersDataGrid
          isBankNoteVisible
          isCompanyVisible
          isCustomerNoteVisible={false}
          purchaseOrders={purchaseOrders}
          actionItems={
            check(role, Action.ViewPurchaseOrdersActionMenu) ? [] : []
          }
        />
      </Box>
    </Box>
  );
}
