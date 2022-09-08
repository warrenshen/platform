import { Box } from "@material-ui/core";
import UpdatePurchaseOrderBankNoteModal from "components/PurchaseOrder/v2/UpdatePurchaseOrderBankNoteModal";
import {
  Companies,
  PurchaseOrderFragment,
  PurchaseOrders,
} from "generated/graphql";
import { NewPurchaseOrderStatus } from "lib/enum";
import { useMemo, useState } from "react";

import PurchaseOrdersDataGridNew from "./PurchaseOrdersDataGridNew";

interface Props {
  isApprovedByVendor: boolean;
  isMultiSelectEnabled: boolean;
  purchaseOrders: PurchaseOrderFragment[];
  selectedPurchaseOrderIds?: PurchaseOrders["id"][];
  selectablePurchaseOrderStatuses: NewPurchaseOrderStatus[];
  handleClickCustomer?: (customerId: Companies["id"]) => void;
  handleSelectPurchaseOrders?: (
    purchaseOrders: PurchaseOrderFragment[]
  ) => void;
}

const BankPurchaseOrdersDataGridNew = ({
  isApprovedByVendor,
  isMultiSelectEnabled,
  purchaseOrders,
  selectedPurchaseOrderIds,
  selectablePurchaseOrderStatuses,
  handleClickCustomer,
  handleSelectPurchaseOrders,
}: Props) => {
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
      <PurchaseOrdersDataGridNew
        isApprovedByVendor={isApprovedByVendor}
        isBankNoteVisible
        isCompanyVisible
        isCustomerNoteVisible={false}
        isFilteringEnabled
        isMultiSelectEnabled={isMultiSelectEnabled}
        purchaseOrders={purchaseOrders}
        selectedPurchaseOrderIds={selectedPurchaseOrderIds}
        selectablePurchaseOrderStatuses={selectablePurchaseOrderStatuses}
        handleClickCustomer={handleClickCustomer}
        handleClickPurchaseOrderBankNote={handleClickPurchaseOrderBankNote}
        handleSelectPurchaseOrders={handleSelectPurchaseOrders}
      />
    </Box>
  );
};

export default BankPurchaseOrdersDataGridNew;
