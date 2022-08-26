import { Box } from "@material-ui/core";
import LoansDataGrid from "components/Loans/LoansDataGrid";
import UpdatePurchaseOrderBankNoteModal from "components/PurchaseOrder/v2/UpdatePurchaseOrderBankNoteModal";
import { Companies, LoanFragment, Loans } from "generated/graphql";
import { PartnerEnum } from "lib/enum";
import { useState } from "react";

interface Props {
  isDaysPastDueVisible?: boolean;
  isDebtFacilityStatusVisible?: boolean;
  isDisbursementIdentifierVisible?: boolean;
  isMaturityVisible?: boolean;
  isMultiSelectEnabled?: boolean;
  isReportingVisible?: boolean;
  isSurveillanceStatusVisible?: boolean;
  matureDays?: number;
  loans: LoanFragment[];
  selectedLoanIds?: Loans["id"][];
  handleClickCustomer?: (customerId: Companies["id"]) => void;
  handleSelectLoans?: (loans: LoanFragment[]) => void;
}

export default function BankLoansDataGrid({
  isDaysPastDueVisible = false,
  isDebtFacilityStatusVisible = false,
  isDisbursementIdentifierVisible = false,
  isMaturityVisible = false,
  isMultiSelectEnabled = false,
  isReportingVisible,
  isSurveillanceStatusVisible = false,
  matureDays,
  loans,
  selectedLoanIds,
  handleClickCustomer,
  handleSelectLoans,
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
      <LoansDataGrid
        isArtifactVisible
        isArtifactBankNoteVisible
        isCompanyVisible
        isDebtFacilityStatusVisible={isDebtFacilityStatusVisible}
        isDaysPastDueVisible={isDaysPastDueVisible}
        isDisbursementIdentifierVisible={isDisbursementIdentifierVisible}
        isFilteringEnabled
        isMaturityVisible={isMaturityVisible}
        isMultiSelectEnabled={isMultiSelectEnabled}
        isReportingVisible={isReportingVisible}
        isSurveillanceStatusVisible={isSurveillanceStatusVisible}
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
