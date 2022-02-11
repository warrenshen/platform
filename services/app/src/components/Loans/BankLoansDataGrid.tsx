import { Box } from "@material-ui/core";
import LoansDataGrid from "components/Loans/LoansDataGrid";
import UpdatePurchaseOrderBankNoteModal from "components/PurchaseOrder/UpdatePurchaseOrderBankNoteModal";
import { Companies, LoanFragment, Loans } from "generated/graphql";
import { PartnerEnum } from "lib/enum";
import { useState } from "react";

interface Props {
  isMultiSelectEnabled?: boolean;
  matureDays?: number;
  loans: LoanFragment[];
  selectedLoanIds?: Loans["id"][];
  handleClickCustomer?: (customerId: Companies["id"]) => void;
  handleSelectLoans?: (loans: LoanFragment[]) => void;
}

export default function BankLoansDataGrid({
  isMultiSelectEnabled = false,
  matureDays,
  loans,
  selectedLoanIds,
  handleClickCustomer,
  handleSelectLoans,
}: Props) {
  const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] = useState(null);

  return (
    <Box display="flex" flexDirection="column">
      {!!selectedPurchaseOrderId && (
        <UpdatePurchaseOrderBankNoteModal
          purchaseOrderId={selectedPurchaseOrderId}
          handleClose={() => setSelectedPurchaseOrderId(null)}
        />
      )}
      <LoansDataGrid
        isArtifactVisible
        isArtifactBankNoteVisible
        isCompanyVisible
        isMaturityVisible={false}
        isMultiSelectEnabled={isMultiSelectEnabled}
        isFilteringEnabled
        partnerType={PartnerEnum.BOTH}
        matureDays={matureDays}
        loans={loans}
        selectedLoanIds={selectedLoanIds}
        handleClickCustomer={handleClickCustomer}
        handleClickPurchaseOrderBankNote={(purchaseOrderId) =>
          setSelectedPurchaseOrderId(purchaseOrderId)
        }
        handleSelectLoans={handleSelectLoans}
      />
    </Box>
  );
}
