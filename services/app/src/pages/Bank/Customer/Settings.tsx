import { Box, Checkbox, FormControlLabel, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import MetrcApiKeys from "components/Settings/Bank/MetrcApiKeys";
import SyncMetrcData from "components/Settings/Bank/SyncMetrcData";
import CustomerSettings from "components/Settings/CustomerSettings";
import CollectionsBank from "components/Shared/BespokeBankAssignment/CollectionsBank";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import ModalButton from "components/Shared/Modal/ModalButton";
import PageContent from "components/Shared/Page/PageContent";
import UpdateCompanyLicensesModal from "components/ThirdParties/UpdateCompanyLicensesModal";
import UpsertFeatureFlagsModal from "components/Settings/Bank/UpsertFeatureFlagsModal";
import {
  Companies,
  CompanySettingsFragment,
  ContractFragment,
  MetrcApiKeyFragment,
  useGetCompanyForBankQuery,
} from "generated/graphql";
import { FileTypeEnum, AllFeatureFlags } from "lib/enum";

interface Props {
  companyId: Companies["id"];
}

export default function BankCustomerSettingsSubpage({ companyId }: Props) {
  const { data, refetch, error } = useGetCompanyForBankQuery({
    fetchPolicy: "network-only",
    variables: {
      companyId,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const company = data?.companies_by_pk;
  const settings = company?.settings as CompanySettingsFragment;
  const contract = company?.contract as ContractFragment;
  const metrcApiKey = company?.settings?.metrc_api_key as MetrcApiKeyFragment;
  const companyLicenses = company?.licenses || [];
  const featureFlagsPayload = settings?.feature_flags_payload || {};

  return company ? (
    <PageContent title={"Settings"}>
      <CustomerSettings
        companyId={companyId}
        company={company}
        settings={settings}
        contract={contract}
        bankAccounts={company?.bank_accounts || []}
        handleDataChange={() => refetch()}
      />
      <Box mt={8} mb={16}>
        <h2>Additional Settings</h2>
        <Alert severity="info">
          Note: the settings below are only visible by bank users (you are a
          bank user).
        </Alert>
        <Box mt={2} mb={1}>
          <Typography variant="subtitle1">
            Bespoke Collections Account
          </Typography>
          <Box display="flex">
            <CollectionsBank
              companySettingsId={settings?.id}
              assignedBespokeBankAccount={
                company.settings?.collections_bespoke_bank_account || undefined
              }
            />
          </Box>
        </Box>
        <Box mt={1} mb={1}>
          <Typography variant="subtitle1">Licenses</Typography>
          <Box mt={1} mb={1}>
            {companyLicenses.map((companyLicense) => (
              <Box key={companyLicense.id}>
                <Typography>
                  {companyLicense.license_number || "License Number TBD"}
                </Typography>
                {!!companyLicense.file_id && (
                  <DownloadThumbnail
                    isCountVisible={false}
                    fileIds={[companyLicense.file_id]}
                    fileType={FileTypeEnum.COMPANY_LICENSE}
                  />
                )}
              </Box>
            ))}
          </Box>
          <ModalButton
            label={"Edit Licenses"}
            color="default"
            variant="outlined"
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
        <Box mt={3} mb={1}>
          <Typography variant="subtitle1">Supported Features</Typography>
          <Box mt={2}>
            <ModalButton
              label={"Edit Features"}
              color={"primary"}
              modal={({ handleClose }) => (
                <UpsertFeatureFlagsModal
                  companySettingsId={settings.id}
                  featureFlagsPayload={featureFlagsPayload}
                  handleClose={() => {
                    refetch();
                    handleClose();
                  }}
                />
              )}
            />
          </Box>
          <Box mt={2}>
            {AllFeatureFlags.map((featureFlag) => (
              <Box key={featureFlag}>
                <FormControlLabel
                  control={
                    <Checkbox
                      disabled
                      checked={!!featureFlagsPayload[featureFlag]}
                      color="primary"
                    />
                  }
                  label={featureFlag}
                />
              </Box>
            ))}
          </Box>
        </Box>
        <Box mt={3} mb={1}>
          <Typography variant="subtitle1">Metrc API Keys</Typography>
          <Box display="flex">
            <MetrcApiKeys
              metrcApiKey={metrcApiKey}
              companySettingsId={settings?.id}
              handleDataChange={refetch}
            />
          </Box>
        </Box>
        <Box mt={3} mb={1}>
          <Typography variant="subtitle1">Sync Metrc Data</Typography>
          <Box display="flex">
            <SyncMetrcData companyId={company.id}></SyncMetrcData>
          </Box>
        </Box>
      </Box>
    </PageContent>
  ) : null;
}
