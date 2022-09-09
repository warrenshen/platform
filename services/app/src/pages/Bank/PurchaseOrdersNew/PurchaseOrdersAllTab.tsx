import { Box, InputAdornment, TextField, Typography } from "@material-ui/core";
import BankPurchaseOrdersDataGridNew from "components/PurchaseOrder/v2/BankPurchaseOrdersDataGridNew";
import {
  CustomerForBankFragment,
  useGetPurchaseOrdersSubscription,
} from "generated/graphql";
import { useFilterConfirmedPurchaseOrders } from "hooks/useFilterPurchaseOrders";
import { SearchIcon } from "icons";
import { ReadyNewPurchaseOrderStatuses } from "lib/enum";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";

export default function BankPurchaseOrdersAllTab() {
  const history = useHistory();
  const [searchQuery, setSearchQuery] = useState("");

  const { data, error } = useGetPurchaseOrdersSubscription();

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const purchaseOrders = useFilterConfirmedPurchaseOrders(searchQuery, data);

  const handleClickCustomer = useMemo(
    () => (customerId: CustomerForBankFragment["id"]) =>
      history.push(
        getBankCompanyRoute(customerId, BankCompanyRouteEnum.PurchaseOrders)
      ),
    [history]
  );

  return (
    <Box mt={3}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-end"
        mt={1}
        mb={4}
      >
        <Box>
          <Typography variant="h6">All</Typography>
        </Box>
      </Box>
      <Box display="flex" mb={4}>
        <TextField
          autoFocus
          label="Search"
          value={searchQuery}
          onChange={({ target: { value } }) => setSearchQuery(value)}
          style={{ width: 430 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        data-cy="incomplete-purchase-orders-data-grid-container"
      >
        <BankPurchaseOrdersDataGridNew
          purchaseOrders={purchaseOrders}
          selectablePurchaseOrderStatuses={ReadyNewPurchaseOrderStatuses}
          handleClickCustomer={handleClickCustomer}
          isApprovedByVendor={true}
          isMultiSelectEnabled={false}
        />
      </Box>
    </Box>
  );
}
