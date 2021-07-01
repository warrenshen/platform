import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  Typography,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import MetrcApiKeys from "components/Settings/Bank/MetrcApiKeys";
import SyncMetrcData from "components/Settings/Bank/SyncMetrcData";
import CustomerSettings from "components/Settings/CustomerSettings";
import AssignAdvancesBespokeBankAccount from "components/Shared/BankAssignment/AssignAdvancesBespokeBankAccount";
import AssignCollectionsBespokeBankAccount from "components/Shared/BankAssignment/AssignCollectionsBespokeBankAccount";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import ModalButton from "components/Shared/Modal/ModalButton";
import PageContent from "components/Shared/Page/PageContent";
import UpdateCompanyLicensesModal from "components/ThirdParties/UpdateCompanyLicensesModal";
import UpsertCustomMessagesModal from "components/Settings/Bank/UpsertCustomMessagesModal";
import UpsertFeatureFlagsModal from "components/Settings/Bank/UpsertFeatureFlagsModal";
import {
  Companies,
  ContractFragment,
  MetrcApiKeyFragment,
  useGetCompanyForBankQuery,
} from "generated/graphql";
import {
  getCustomMessageName,
  getFeatureFlagName,
  getFeatureFlagDescription,
} from "lib/companies";
import { AllCustomMessages, AllFeatureFlags, FileTypeEnum } from "lib/enum";

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
  const settings = company?.settings;
  const contract = company?.contract as ContractFragment;
  const metrcApiKey = company?.settings?.metrc_api_key as MetrcApiKeyFragment;
  const companyLicenses = company?.licenses || [];
  const featureFlagsPayload = settings?.feature_flags_payload || {};
  const customMessagesPayload = settings?.custom_messages_payload || {};

  if (!company || !settings) {
    return null;
  }

  return (
    <PageContent title={"Settings"}>
      <CustomerSettings
        companyId={companyId}
        company={company}
        settings={settings}
        contract={contract}
        bankAccounts={company?.bank_accounts || []}
        handleDataChange={() => refetch()}
      />
      <Box my={8}>
        <Divider />
      </Box>
      <Box mb={16}>
        <Box>
          <Typography variant="h5">
            Additional Settings (Bank User Only)
          </Typography>
          <Box mt={2}>
            <Alert severity="warning">
              <Typography variant={"body1"}>
                Note: the settings below are ONLY visible to bank users (you are
                a bank user).
              </Typography>
            </Alert>
          </Box>
        </Box>
        <Box display="flex" flexDirection="column" mt={4}>
          <Typography variant="h6">
            <b>Bespoke Financial Bank Accounts</b>
          </Typography>
          <Typography variant="body2">
            BF Advances Bank Account: BF bank account that BF sends advances
            from.
          </Typography>
          <Typography variant="body2">
            BF Payments Bank Account: BF bank account that customer should send
            payments to.
          </Typography>
          <Box display="flex">
            <Box display="flex">
              <AssignAdvancesBespokeBankAccount
                companySettingsId={settings?.id}
                assignedBespokeBankAccount={
                  company.settings?.advances_bespoke_bank_account || null
                }
                handleDataChange={refetch}
              />
            </Box>
            <Box display="flex">
              <AssignCollectionsBespokeBankAccount
                companySettingsId={settings?.id}
                assignedBespokeBankAccount={
                  company.settings?.collections_bespoke_bank_account || null
                }
                handleDataChange={refetch}
              />
            </Box>
          </Box>
        </Box>
        <Box mt={4}>
          <Typography variant="h6">
            <b>Licenses</b>
          </Typography>
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
        <Box mt={4}>
          <Typography variant="h6">
            <b>Supported Features</b>
          </Typography>
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
          <Box display="flex" flexDirection="column">
            {AllFeatureFlags.map((featureFlag) => (
              <Box key={featureFlag} mt={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      disabled
                      checked={!!featureFlagsPayload[featureFlag]}
                      color="primary"
                    />
                  }
                  label={getFeatureFlagName(featureFlag)}
                />
                <Box pl={2}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {getFeatureFlagDescription(featureFlag)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
        <Box mt={4}>
          <Typography variant="h6">
            <b>Metrc</b>
          </Typography>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle1">API Key</Typography>
            <MetrcApiKeys
              metrcApiKey={metrcApiKey}
              companySettingsId={settings?.id}
              handleDataChange={refetch}
            />
          </Box>
          <Box mt={2}>
            <Typography variant="subtitle1">Sync Metrc Data</Typography>
            <Box display="flex">
              <SyncMetrcData companyId={company.id}></SyncMetrcData>
            </Box>
          </Box>
        </Box>
        <Box mt={4}>
          <Typography variant="h6">
            <b>Custom Messages</b>
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Custom messages are messages configured by a bank user that are
            shown to the customer. The name / type of the custom message
            indicates where the message will be shown. You may leave the value
            of a custom message blank, in which case no message will be shown to
            the customer.
          </Typography>
          <Box mt={2}>
            <ModalButton
              label={"Edit Custom Messages"}
              color={"primary"}
              modal={({ handleClose }) => (
                <UpsertCustomMessagesModal
                  companySettingsId={settings.id}
                  customMessagesPayload={customMessagesPayload}
                  handleClose={() => {
                    refetch();
                    handleClose();
                  }}
                />
              )}
            />
          </Box>
          <Box display="flex" flexDirection="column">
            {AllCustomMessages.map((customMessage) => (
              <Box key={customMessage} mt={2}>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    <b>{getCustomMessageName(customMessage)}</b>
                  </Typography>
                </Box>
                <Box pl={2} mt={1}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {customMessagesPayload[customMessage] || "-"}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </PageContent>
  );
}
