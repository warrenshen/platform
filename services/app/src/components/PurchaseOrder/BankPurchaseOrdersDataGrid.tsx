import { Box } from "@material-ui/core";
import PurchaseOrdersDataGrid from "components/PurchaseOrder/PurchaseOrdersDataGrid";
import UpdatePurchaseOrderBankNoteModal from "components/PurchaseOrder/UpdatePurchaseOrderBankNoteModal";
import {
  Companies,
  PurchaseOrderFragment,
  PurchaseOrders,
} from "generated/graphql";
import { useMemo, useState } from "react";

interface Props {
  purchaseOrders: PurchaseOrderFragment[];
  selectedPurchaseOrderIds?: PurchaseOrders["id"][];
  handleClickCustomer?: (customerId: Companies["id"]) => void;
  handleSelectPurchaseOrders?: (
    purchaseOrders: PurchaseOrderFragment[]
  ) => void;
  isApprovedByVendor: boolean;
}

export default function BankPurchaseOrdersDataGrid({
  purchaseOrders,
  selectedPurchaseOrderIds,
  handleClickCustomer,
  handleSelectPurchaseOrders,
  isApprovedByVendor,
}: Props) {
  const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] = useState(null);

  const handleClickPurchaseOrderBankNote = useMemo(
    () => (purchaseOrderId: PurchaseOrderFragment["id"]) => {
      setSelectedPurchaseOrderId(purchaseOrderId);
    },
    []
  );

  return (
    <Box display="flex" flexDirection="column">
      {!!selectedPurchaseOrderId && (
        <UpdatePurchaseOrderBankNoteModal
          purchaseOrderId={selectedPurchaseOrderId}
          handleClose={() => setSelectedPurchaseOrderId(null)}
        />
      )}
      <PurchaseOrdersDataGrid
        isApprovedByVendor={isApprovedByVendor}
        isBankNoteVisible
        isCompanyVisible
        isCustomerNoteVisible={false}
        isFilteringEnabled
        isMultiSelectEnabled
        purchaseOrders={purchaseOrders}
        selectedPurchaseOrderIds={selectedPurchaseOrderIds}
        handleClickCustomer={handleClickCustomer}
        handleClickPurchaseOrderBankNote={handleClickPurchaseOrderBankNote}
        handleSelectPurchaseOrders={handleSelectPurchaseOrders}
      />
    </Box>
  );
}
