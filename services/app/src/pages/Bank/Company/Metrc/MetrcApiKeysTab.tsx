import { Box, Typography } from "@material-ui/core";
import CompanyFacilitiesDataGrid from "components/CompanyFacilities/CompanyFacilitiesDataGrid";
import CreateUpdateCompanyFacilityModal from "components/CompanyFacilities/CreateUpdateCompanyFacilityModal";
import DeleteCompanyFacilityModal from "components/CompanyFacilities/DeleteCompanyFacilityModal";
import CompanyLicensesDataGrid from "components/CompanyLicenses/CompanyLicensesDataGrid";
import CreateUpdateCompanyLicenseModal from "components/CompanyLicenses/CreateUpdateCompanyLicenseModal";
import DeleteLicenseModal from "components/CompanyLicenses/DeleteLicenseModal";
import MetrcApiKeysList from "components/Metrc/MetrcApiKeysList";
import SyncMetrcData from "components/Metrc/SyncMetrcData";
import ModalButton from "components/Shared/Modal/ModalButton";
import {
  Companies,
  CompanyFacilities,
  CompanyFacilityFragment,
  CompanyLicenseFragment,
  CompanyLicenses,
  useGetMetrcMetadataByCompanyIdQuery,
} from "generated/graphql";
import { ActionType } from "lib/enum";
import { useMemo, useState } from "react";

function CompanyFacilitiesSection({
  companyId,
  companyFacilities,
  refetch,
}: {
  companyId: Companies["id"];
  companyFacilities: CompanyFacilityFragment[];
  refetch: () => void;
}) {
  const [selectedCompanyFacilitiesIds, setSelectedCompanyFacilitiesIds] =
    useState<CompanyFacilities["id"]>([]);

  const handleSelectCompanyFacilities = useMemo(
    () => (companyFacilities: CompanyFacilityFragment[]) => {
      setSelectedCompanyFacilitiesIds(
        companyFacilities.map((companyFacility) => companyFacility.id)
      );
    },
    []
  );

  return (
    <Box>
      <Box display="flex" flexDirection="row-reverse" mb={2}>
        <Box>
          <ModalButton
            isDisabled={selectedCompanyFacilitiesIds.length !== 0}
            label={"Create Facility"}
            color={"primary"}
            modal={({ handleClose }) => (
              <CreateUpdateCompanyFacilityModal
                actionType={ActionType.New}
                companyId={companyId}
                companyFacilityId={null}
                handleClose={() => {
                  refetch();
                  handleClose();
                }}
              />
            )}
          />
        </Box>
        <Box mr={2}>
          <ModalButton
            isDisabled={selectedCompanyFacilitiesIds.length !== 1}
            label={"Edit Facility"}
            color={"primary"}
            modal={({ handleClose }) => (
              <CreateUpdateCompanyFacilityModal
                actionType={ActionType.Update}
                companyId={companyId}
                companyFacilityId={selectedCompanyFacilitiesIds[0]}
                handleClose={() => {
                  refetch();
                  handleClose();
                }}
              />
            )}
          />
        </Box>
        <Box mr={2}>
          <ModalButton
            isDisabled={selectedCompanyFacilitiesIds.length !== 1}
            label={"Delete Facility"}
            variant={"outlined"}
            modal={({ handleClose }) => (
              <DeleteCompanyFacilityModal
                companyFacilityId={selectedCompanyFacilitiesIds[0]}
                handleClose={() => {
                  refetch();
                  handleClose();
                }}
              />
            )}
          />
        </Box>
      </Box>
      <Box>
        <CompanyFacilitiesDataGrid
          companyFacilities={companyFacilities}
          selectedCompanyFacilitiesIds={selectedCompanyFacilitiesIds}
          handleSelectCompanyFacilities={handleSelectCompanyFacilities}
        />
      </Box>
    </Box>
  );
}

function CompanyLicensesSection({
  companyId,
  companyLicenses,
  refetch,
}: {
  companyId: Companies["id"];
  companyLicenses: CompanyLicenseFragment[];
  refetch: () => void;
}) {
  const [selectedCompanyLicensesIds, setSelectedCompanyLicensesIds] = useState<
    CompanyLicenses["id"]
  >([]);

  const handleSelectCompanyLicenses = useMemo(
    () => (companyLicenses: CompanyLicenseFragment[]) => {
      setSelectedCompanyLicensesIds(
        companyLicenses.map((companyLicense) => companyLicense.id)
      );
    },
    []
  );

  return (
    <Box>
      <Box display="flex" flexDirection="row-reverse" mb={2}>
        <Box>
          <ModalButton
            dataCy={"create-license-button"}
            isDisabled={selectedCompanyLicensesIds.length !== 0}
            label={"Create License"}
            color={"primary"}
            modal={({ handleClose }) => (
              <CreateUpdateCompanyLicenseModal
                actionType={ActionType.New}
                companyLicenseId={null}
                companyId={companyId}
                handleClose={() => {
                  refetch();
                  handleClose();
                }}
              />
            )}
          />
        </Box>
        <Box mr={2}>
          <ModalButton
            dataCy={"edit-license-button"}
            isDisabled={selectedCompanyLicensesIds.length !== 1}
            label={"Edit License"}
            color={"primary"}
            modal={({ handleClose }) => (
              <CreateUpdateCompanyLicenseModal
                actionType={ActionType.Update}
                companyId={companyId}
                companyLicenseId={selectedCompanyLicensesIds[0]}
                handleClose={() => {
                  refetch();
                  handleClose();
                  setSelectedCompanyLicensesIds([]);
                }}
              />
            )}
          />
        </Box>
        <Box mr={2}>
          <ModalButton
            dataCy={"delete-license-button"}
            isDisabled={selectedCompanyLicensesIds.length !== 1}
            label={"Delete License"}
            variant={"outlined"}
            modal={({ handleClose }) => (
              <DeleteLicenseModal
                licenseId={selectedCompanyLicensesIds[0]}
                handleClose={() => {
                  refetch();
                  handleClose();
                }}
              />
            )}
          />
        </Box>
      </Box>
      <Box data-cy="company-license-table-container">
        <CompanyLicensesDataGrid
          isUnderwritingInfoVisible
          companyLicenses={companyLicenses}
          selectedCompanyLicensesIds={selectedCompanyLicensesIds}
          handleSelectCompanyLicenses={handleSelectCompanyLicenses}
        />
      </Box>
    </Box>
  );
}

interface Props {
  companyId: Companies["id"];
}

export default function CompanyMetrcApiKeysTab({ companyId }: Props) {
  const { data, refetch } = useGetMetrcMetadataByCompanyIdQuery({
    variables: {
      company_id: companyId,
    },
  });

  const company = data?.companies_by_pk;
  const companyFacilities = company?.company_facilities || [];
  const companyLicenses = company?.licenses || [];

  return (
    <Box mt={3}>
      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="h6">
          <strong>Facilities</strong>
        </Typography>
        <CompanyFacilitiesSection
          companyId={companyId}
          companyFacilities={companyFacilities}
          refetch={refetch}
        />
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="h6">
          <strong>Licenses</strong>
        </Typography>
        <CompanyLicensesSection
          companyId={companyId}
          companyLicenses={companyLicenses}
          refetch={refetch}
        />
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="h6">
          <strong>Metrc API Keys</strong>
        </Typography>
        <MetrcApiKeysList companyId={companyId} />
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="h6">
          <strong>Download Metrc Data</strong>
        </Typography>
        <Box display="flex">
          <SyncMetrcData companyId={companyId} />
        </Box>
      </Box>
    </Box>
  );
}
