import { Box, InputAdornment, TextField, Typography } from "@material-ui/core";
import PurchaseOrdersDataGrid from "components/PurchaseOrder/v2/PurchaseOrdersDataGrid";
import {
  CustomerForBankFragment,
  PurchaseOrderFragment,
  PurchaseOrders,
  useGetVendorPurchaseOrdersByStatusQuery,
} from "generated/graphql";
import { useFilterConfirmedPurchaseOrders } from "hooks/useFilterPurchaseOrders";
import { SearchIcon } from "icons";
import { VendorArchivedPurchaseOrderStatuses } from "lib/enum";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  vendorId: string;
}

const VendorPurchaseOrdersArchivedTab = ({ vendorId }: Props) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const { data, error } = useGetVendorPurchaseOrdersByStatusQuery({
    variables: {
      vendor_id: vendorId,
      statuses: VendorArchivedPurchaseOrderStatuses,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const purchaseOrders = useFilterConfirmedPurchaseOrders(searchQuery, data);

  const [selectedPurchaseOrderIds, setSelectedPurchaseOrderIds] = useState<
    PurchaseOrders["id"]
  >([]);

  const handleSelectPurchaseOrders = useMemo(
    () => (purchaseOrders: PurchaseOrderFragment[]) => {
      setSelectedPurchaseOrderIds(
        purchaseOrders.map((purchaseOrder) => purchaseOrder.id)
      );
    },
    [setSelectedPurchaseOrderIds]
  );

  const handleClickCustomer = useMemo(
    () => (customerId: CustomerForBankFragment["id"]) =>
      navigate(
        getBankCompanyRoute(customerId, BankCompanyRouteEnum.PurchaseOrders)
      ),
    [navigate]
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
          <Typography variant="h6">Purchase Orders</Typography>
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
      <Box display="flex" flexDirection="column">
        <PurchaseOrdersDataGrid
          isCompanyVisible
          isCustomerNoteVisible={false}
          isFilteringEnabled
          isVendorVisible={false}
          purchaseOrders={purchaseOrders}
          selectedPurchaseOrderIds={selectedPurchaseOrderIds}
          selectablePurchaseOrderStatuses={VendorArchivedPurchaseOrderStatuses}
          handleClickCustomer={handleClickCustomer}
          handleSelectPurchaseOrders={handleSelectPurchaseOrders}
        />
      </Box>
    </Box>
  );
};

export default VendorPurchaseOrdersArchivedTab;
