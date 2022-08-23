import { Box } from "@material-ui/core";
import EbbaApplicationsDataGrid from "components/EbbaApplications/EbbaApplicationsDataGrid";
import UpdateEbbaApplicationBankNoteModal from "components/EbbaApplications/UpdateEbbaApplicationsBankNoteModal";
import {
  EbbaApplicationFragment,
  EbbaApplications,
  GetOpenEbbaApplicationsByCategoryQuery,
} from "generated/graphql";
import { useMemo, useState } from "react";

interface Props {
  ebbaApplications: GetOpenEbbaApplicationsByCategoryQuery["ebba_applications"];
  selectedEbbaApplicationIds?: EbbaApplications["id"][];
  handleSelectEbbaApplications?: (
    ebbaApplications: EbbaApplicationFragment[]
  ) => void;
  isApprovedAtVisible?: boolean;
  isRejectedAtVisible?: boolean;
  isBorrowingBaseFieldsVisible?: boolean;
  isCategoryVisible?: boolean;
  isCompanyVisible?: boolean;
  isExpirationDateVisible?: boolean;
  isMultiSelectEnabled?: boolean;
  isBorrowingBaseAdjustmentAmountVisible?: boolean;
  isBorrowingBaseAdjustmentNoteVisible?: boolean;
}

export default function BankEbbaApplicationsDataGrid({
  ebbaApplications,
  selectedEbbaApplicationIds,
  handleSelectEbbaApplications,
  isApprovedAtVisible,
  isRejectedAtVisible,
  isBorrowingBaseFieldsVisible,
  isCategoryVisible,
  isCompanyVisible,
  isExpirationDateVisible,
  isMultiSelectEnabled,
  isBorrowingBaseAdjustmentAmountVisible,
  isBorrowingBaseAdjustmentNoteVisible,
}: Props) {
  const [selectedEbbaApplicationId, setSelectedEbbaApplicationId] =
    useState(null);

  const handleClickEbbaApplicationBankNote = useMemo(
    () => (ebbaApplicationId: EbbaApplicationFragment["id"]) => {
      setSelectedEbbaApplicationId(ebbaApplicationId);
    },
    []
  );

  return (
    <Box display="flex" flexDirection="column">
      {!!selectedEbbaApplicationId && (
        <UpdateEbbaApplicationBankNoteModal
          ebbaApplication={
            !!selectedEbbaApplicationId &&
            ebbaApplications.find(
              (ebba) => ebba.id === selectedEbbaApplicationId
            )
          }
          handleClose={() => setSelectedEbbaApplicationId(null)}
        />
      )}
      <EbbaApplicationsDataGrid
        isApprovedAtVisible={isApprovedAtVisible}
        isRejectedAtVisible={isRejectedAtVisible}
        isBorrowingBaseFieldsVisible={isBorrowingBaseFieldsVisible}
        isCategoryVisible={isCategoryVisible}
        isCompanyVisible={isCompanyVisible}
        isExpirationDateVisible={isExpirationDateVisible}
        isMultiSelectEnabled={isMultiSelectEnabled}
        isBorrowingBaseAdjustmentAmountVisible={
          isBorrowingBaseAdjustmentAmountVisible
        }
        isBorrowingBaseAdjustmentNoteVisible={
          isBorrowingBaseAdjustmentNoteVisible
        }
        ebbaApplications={ebbaApplications}
        selectedEbbaApplicationIds={selectedEbbaApplicationIds}
        handleSelectEbbaApplications={handleSelectEbbaApplications}
        handleClickBorrowingBaseBankNote={handleClickEbbaApplicationBankNote}
      />
    </Box>
  );
}
