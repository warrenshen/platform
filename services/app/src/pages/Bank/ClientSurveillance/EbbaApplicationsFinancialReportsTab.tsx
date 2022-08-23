import { Box, TextField, Typography } from "@material-ui/core";
import CreateUpdateFinancialReportCertificationModal from "components/EbbaApplication/CreateUpdateFinancialReportCertificationModal";
import DeleteEbbaApplicationModal from "components/EbbaApplication/DeleteEbbaApplicationModal";
import ModalButton from "components/Shared/Modal/ModalButton";
import {
  EbbaApplicationFragment,
  EbbaApplications,
  useGetOpenEbbaApplicationsByCategoryQuery,
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

export default function EbbaApplicationsFinancialReportsTab() {
  const { data, error, refetch } = useGetOpenEbbaApplicationsByCategoryQuery({
    fetchPolicy: "network-only",
    variables: {
      category: CustomerSurveillanceCategoryEnum.FinancialReport,
    },
  });

  if (error) {
    alert(`Error in query: ${error.message}`);
    console.error({ error });
  }

  const [searchQuery, setSearchQuery] = useState("");

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

  const handleSelectEbbaApplications = useMemo(
    () => (ebbaApplications: EbbaApplicationFragment[]) =>
      setSelectedEbbaApplicationIds(
        ebbaApplications.map((ebbaApplication) => ebbaApplication.id)
      ),
    [setSelectedEbbaApplicationIds]
  );

  const nonDispensaryEbbaApplications = ebbaApplications.filter(
    (ebbaApplication) => {
      const productType = !!ebbaApplication?.company?.contract?.product_type
        ? ebbaApplication.company.contract.product_type
        : null;

      return !!productType &&
        productType !== ProductTypeEnum.DispensaryFinancing
        ? true
        : false;
    }
  );

  const dispensaryEbbaApplications = ebbaApplications.filter(
    (ebbaApplication) => {
      const productType = !!ebbaApplication?.company?.contract?.product_type
        ? ebbaApplication.company.contract.product_type
        : null;

      return !!productType &&
        productType === ProductTypeEnum.DispensaryFinancing
        ? true
        : false;
    }
  );

  return (
    <Box mt={2}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-end"
        mb={2}
      >
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
              modal={({ handleClose }) => (
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
              )}
            />
          </Box>
          <Box mr={2}>
            <ModalButton
              isDisabled={!selectedEbbaApplication}
              label={"Delete Certification"}
              variant={"outlined"}
              modal={({ handleClose }) => (
                <DeleteEbbaApplicationModal
                  ebbaApplicationId={selectedEbbaApplication?.id}
                  handleClose={() => {
                    refetch();
                    handleClose();
                  }}
                />
              )}
            />
          </Box>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mb={2}>
        <Typography variant={"h6"}>Not Dispensary Financing</Typography>
        <BankEbbaApplicationsDataGrid
          isCompanyVisible
          isExpirationDateVisible
          isMultiSelectEnabled
          isBorrowingBaseAdjustmentAmountVisible={false}
          isBorrowingBaseAdjustmentNoteVisible={false}
          ebbaApplications={nonDispensaryEbbaApplications}
          selectedEbbaApplicationIds={selectedEbbaApplicationIds}
          handleSelectEbbaApplications={handleSelectEbbaApplications}
        />
      </Box>
      <Box display="flex" flexDirection="column">
        <Typography variant={"h6"}>Dispensary Financing</Typography>
        <BankEbbaApplicationsDataGrid
          isCompanyVisible
          isExpirationDateVisible
          isMultiSelectEnabled
          isBorrowingBaseAdjustmentAmountVisible={false}
          isBorrowingBaseAdjustmentNoteVisible={false}
          ebbaApplications={dispensaryEbbaApplications}
          selectedEbbaApplicationIds={selectedEbbaApplicationIds}
          handleSelectEbbaApplications={handleSelectEbbaApplications}
        />
      </Box>
    </Box>
  );
}
