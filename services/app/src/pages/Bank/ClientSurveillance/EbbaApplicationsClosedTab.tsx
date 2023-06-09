import { Box, TextField } from "@material-ui/core";
import CreateUpdateBorrowingBaseCertificationModal from "components/EbbaApplication/CreateUpdateBorrowingBaseCertificationModal";
import CreateUpdateFinancialReportCertificationModal from "components/EbbaApplication/CreateUpdateFinancialReportCertificationModal";
import UpdateEbbaApplicationBankNoteModal from "components/EbbaApplications/UpdateEbbaApplicationsBankNoteModal";
import ModalButton from "components/Shared/Modal/ModalButton";
import {
  EbbaApplicationFragment,
  EbbaApplications,
  useGetClosedEbbaApplicationsQuery,
} from "generated/graphql";
import { getCompanyDisplayName } from "lib/companies";
import {
  ActionType,
  CustomerSurveillanceCategoryEnum,
  ProductTypeEnum,
} from "lib/enum";
import { filter } from "lodash";
import { useMemo, useState } from "react";

import BankEbbaApplicationsDataGrid from "./BankEbbaApplicationsDataGrid";

export default function EbbaApplicationsClosedTab() {
  const { data, error, refetch } = useGetClosedEbbaApplicationsQuery({
    fetchPolicy: "network-only",
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const [searchQuery, setSearchQuery] = useState("");
  const [
    selectedUpdateEbbaApplicationBankNoteId,
    setSelectedUpdateEbbaApplicationBankNoteId,
  ] = useState<string>("");

  const ebbaApplications = useMemo(
    () =>
      filter(
        data?.ebba_applications || [],
        (ebbaApplication) =>
          getCompanyDisplayName(ebbaApplication.company)
            .toLowerCase()
            .indexOf(searchQuery.toLowerCase()) >= 0
      ),
    [searchQuery, data?.ebba_applications]
  );

  const [selectedEbbaApplicationIds, setSelectedEbbaApplicationIds] = useState<
    EbbaApplications["id"][]
  >([]);

  const selectedEbbaApplication = useMemo(
    () =>
      selectedEbbaApplicationIds.length === 1
        ? ebbaApplications.find(
            (ebbaApplication) =>
              ebbaApplication.id === selectedEbbaApplicationIds[0]
          )
        : null,
    [ebbaApplications, selectedEbbaApplicationIds]
  );

  const isCategoryBorrowingBase = useMemo(
    () =>
      selectedEbbaApplication?.category ===
      CustomerSurveillanceCategoryEnum.BorrowingBase,
    [selectedEbbaApplication]
  );

  const handleSelectEbbaApplications = useMemo(
    () => (ebbaApplications: EbbaApplicationFragment[]) => {
      setSelectedEbbaApplicationIds(
        ebbaApplications.map((ebbaApplication) => ebbaApplication.id)
      );
    },
    [setSelectedEbbaApplicationIds]
  );

  return (
    <Box mt={2}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-end"
        mb={2}
      >
        {!!selectedUpdateEbbaApplicationBankNoteId && (
          <UpdateEbbaApplicationBankNoteModal
            ebbaApplication={ebbaApplications.find(
              (ebba) => ebba.id === selectedUpdateEbbaApplicationBankNoteId
            )}
            handleClose={() => setSelectedUpdateEbbaApplicationBankNoteId("")}
          />
        )}
        <Box display="flex">
          <TextField
            autoFocus
            label="Search by customer name"
            value={searchQuery}
            onChange={({ target: { value } }) => setSearchQuery(value)}
            style={{ width: 300 }}
          />
        </Box>
        <Box display="flex" flexDirection="row-reverse">
          <Box>
            <ModalButton
              isDisabled={!selectedEbbaApplication}
              label={"Edit Certification"}
              modal={({ handleClose }) =>
                isCategoryBorrowingBase ? (
                  <CreateUpdateBorrowingBaseCertificationModal
                    actionType={ActionType.Update}
                    companyId={selectedEbbaApplication?.company_id}
                    ebbaApplicationId={selectedEbbaApplication?.id}
                    handleClose={() => {
                      refetch();
                      handleClose();
                    }}
                  />
                ) : (
                  <CreateUpdateFinancialReportCertificationModal
                    actionType={ActionType.Update}
                    companyId={selectedEbbaApplication?.company_id}
                    ebbaApplicationId={selectedEbbaApplication?.id}
                    handleClose={() => {
                      refetch();
                      handleClose();
                    }}
                    productType={
                      selectedEbbaApplication?.company?.contract
                        ?.product_type as ProductTypeEnum
                    }
                  />
                )
              }
            />
          </Box>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column">
        <BankEbbaApplicationsDataGrid
          isApprovedAtVisible
          isBorrowingBaseFieldsVisible
          isCategoryVisible
          isCompanyVisible
          isExpirationDateVisible
          isMultiSelectEnabled
          isBorrowingBaseAdjustmentAmountVisible
          isBorrowingBaseAdjustmentNoteVisible
          ebbaApplications={ebbaApplications}
          selectedEbbaApplicationIds={selectedEbbaApplicationIds}
          handleSelectEbbaApplications={handleSelectEbbaApplications}
        />
      </Box>
    </Box>
  );
}
