import { Box } from "@material-ui/core";
import FinancingRequestsDataGrid from "components/Loans/FinancingRequestsDataGrid";
import UpdatePurchaseOrderBankNoteModal from "components/PurchaseOrder/v2/UpdatePurchaseOrderBankNoteModal";
import { Companies, LoanFragment, Loans } from "generated/graphql";
import { useState } from "react";

interface Props {
  financingRequests: LoanFragment[];
  selectedFinancingRequestIds?: Loans["id"][];
  isMultiSelectEnabled?: boolean;
  isApprovalStatusVisible?: boolean;
  handleClickCustomer?: (customerId: Companies["id"]) => void;
  handleSelectFinancingRequests?: (loans: LoanFragment[]) => void;
}

export default function BankFinancingRequestsDataGrid({
  financingRequests,
  selectedFinancingRequestIds,
  isMultiSelectEnabled = false,
  isApprovalStatusVisible = true,
  handleClickCustomer,
  handleSelectFinancingRequests,
}: Props) {
  const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] = useState(null);

  return (
    <Box
      display="flex"
      flexDirection="column"
      data-cy="loans-data-grid-container"
    >
      {!!selectedPurchaseOrderId && (
        <UpdatePurchaseOrderBankNoteModal
          purchaseOrderId={selectedPurchaseOrderId}
          handleClose={() => setSelectedPurchaseOrderId(null)}
        />
      )}
      <FinancingRequestsDataGrid
        selectedFinancingRequestIds={selectedFinancingRequestIds}
        financingRequests={financingRequests}
        isMultiSelectEnabled={isMultiSelectEnabled}
        isApprovalStatusVisible={isApprovalStatusVisible}
        isArtifactVisible
        isArtifactBankNoteVisible
        isCompanyNameVisible
        isFilteringEnabled
        isSurveillanceStatusVisible
        isVendorVisible
        pager
        showComments={false}
        handleSelectFinancingRequests={handleSelectFinancingRequests}
        handleClickCustomer={handleClickCustomer}
        handleClickPurchaseOrderBankNote={(purchaseOrderId) =>
          setSelectedPurchaseOrderId(purchaseOrderId)
        }
      />
    </Box>
  );
}
