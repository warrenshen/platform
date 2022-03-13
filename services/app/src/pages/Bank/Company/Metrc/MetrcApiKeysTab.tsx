import { Box, Typography } from "@material-ui/core";
import CompanyFacilitiesDataGrid from "components/CompanyFacilities/CompanyFacilitiesDataGrid";
import CreateUpdateCompanyFacilityModal from "components/CompanyFacilities/CreateUpdateCompanyFacilityModal";
import DeleteCompanyFacilityModal from "components/CompanyFacilities/DeleteCompanyFacilityModal";
import CompanyLicensesDataGrid from "components/CompanyLicenses/CompanyLicensesDataGrid";
import MetrcApiKeysList from "components/Metrc/MetrcApiKeysList";
import SyncMetrcData from "components/Metrc/SyncMetrcData";
import ModalButton from "components/Shared/Modal/ModalButton";
import UpdateCompanyLicensesModal from "components/CompanyLicenses/UpdateCompanyLicensesModal";
import {
  Companies,
  CompanyFacilities,
  CompanyFacilityFragment,
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
  const [
    selectedCompanyFacilitiesIds,
    setSelectedCompanyFacilitiesIds,
  ] = useState<CompanyFacilities["id"]>([]);

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
  // const metrcApiKeys = company?.metrc_api_keys || [];

  return (
    <Box mt={3}>
      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="h6">
          <strong>Download Metrc Data</strong>
        </Typography>
        <Box display="flex">
          <SyncMetrcData companyId={companyId} />
        </Box>
      </Box>
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
        <Box display="flex" flexDirection="row-reverse" mb={2}>
          <ModalButton
            label={"Edit Licenses"}
            modal={({ handleClose }) => (
              <UpdateCompanyLicensesModal
                companyId={companyId}
                handleClose={() => {
                  refetch();
                  handleClose();
                }}
              />
            )}
          />
        </Box>
        <Box>
          <CompanyLicensesDataGrid
            isUnderwritingInfoVisible
            companyLicenses={companyLicenses}
          />
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="h6">
          <strong>Metrc API Keys</strong>
        </Typography>
        <MetrcApiKeysList companyId={companyId} />
      </Box>
    </Box>
  );
}
