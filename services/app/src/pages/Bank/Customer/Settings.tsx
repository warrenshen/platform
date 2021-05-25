import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import MetrcApiKeys from "components/Settings/Bank/MetrcApiKeys";
import CustomerSettings from "components/Settings/CustomerSettings";
import CollectionsBank from "components/Shared/BespokeBankAssignment/CollectionsBank";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import ModalButton from "components/Shared/Modal/ModalButton";
import PageContent from "components/Shared/Page/PageContent";
import UpdateCompanyLicensesModal from "components/ThirdParties/UpdateCompanyLicensesModal";
import {
  CompanySettingsFragment,
  ContractFragment,
  MetrcApiKeyFragment,
  useCompanyQuery,
} from "generated/graphql";
import { FileTypeEnum } from "lib/enum";

interface Props {
  companyId: string;
}

function BankCustomerSettingsSubpage({ companyId }: Props) {
  const { data, refetch } = useCompanyQuery({
    fetchPolicy: "network-only",
    variables: {
      companyId,
    },
  });

  const company = data?.companies_by_pk;
  const settings = data?.companies_by_pk?.settings as CompanySettingsFragment;
  const contract = data?.companies_by_pk?.contract as ContractFragment;
  const metrcApiKey = data?.companies_by_pk?.settings
    ?.metrc_api_key as MetrcApiKeyFragment;
  let companyLicenses = data?.companies_by_pk?.licenses;
  if (!companyLicenses) {
    companyLicenses = [];
  }

  return company ? (
    <PageContent title={"Settings"}>
      <CustomerSettings
        companyId={companyId}
        company={company}
        settings={settings}
        contract={contract}
        bankAccounts={data?.companies_by_pk?.bank_accounts || []}
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
          <Typography variant="subtitle1">Metrc API Keys</Typography>
          <Box display="flex">
            <MetrcApiKeys
              metrcApiKey={metrcApiKey}
              companySettingsId={settings?.id}
              handleDataChange={refetch}
            />
          </Box>
        </Box>
      </Box>
    </PageContent>
  ) : null;
}

export default BankCustomerSettingsSubpage;
