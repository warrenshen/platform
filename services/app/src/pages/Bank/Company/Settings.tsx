import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  Typography,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import CompanyLicensesDataGrid from "components/CompanyLicenses/CompanyLicensesDataGrid";
import DeleteLicenseModal from "components/CompanyLicenses/DeleteLicenseModal";
import UpdateCompanyLicensesModal from "components/CompanyLicenses/UpdateCompanyLicensesModal";
import ChangeIsDummyAccountModal from "components/Settings/Bank/ChangeIsDummyAccountModal";
import UpsertCustomMessagesModal from "components/Settings/Bank/UpsertCustomMessagesModal";
import UpsertDealOwnersModal from "components/Settings/Bank/UpsertDealOwnersModal";
import UpsertFeatureFlagsModal from "components/Settings/Bank/UpsertFeatureFlagsModal";
import CustomerSettings from "components/Settings/CustomerSettings";
import AssignAdvancesBespokeBankAccount from "components/Shared/BankAssignment/AssignAdvancesBespokeBankAccount";
import AssignCollectionsBespokeBankAccount from "components/Shared/BankAssignment/AssignCollectionsBespokeBankAccount";
import ModalButton from "components/Shared/Modal/ModalButton";
import PageContent from "components/Shared/Page/PageContent";
import UpdateThirdPartyCompanySettingsModal from "components/ThirdParties/UpdateThirdPartyCompanySettingsModal";
import {
  Companies,
  CompanyLicenseFragment,
  CompanyLicenses,
  ContractFragment,
  useGetCompanyForBankQuery,
} from "generated/graphql";
import {
  getCustomMessageName,
  getFeatureFlagDescription,
  getFeatureFlagName,
} from "lib/companies";
import {
  AllCustomMessages,
  AllFeatureFlags,
  FeatureFlagEnum,
  ReportingRequirementsCategoryEnum,
  ReportingRequirementsCategoryToDescription,
  TwoFactorMessageMethodEnum,
  TwoFactorMessageMethodToLabel,
} from "lib/enum";
import { useMemo, useState } from "react";

interface Props {
  companyId: Companies["id"];
}

export default function BankCustomerSettingsSubpage({ companyId }: Props) {
  const [selectedLicensesId, setSelectedLicensesId] = useState<
    CompanyLicenses["id"][]
  >([]);

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

  const handleSelectLicenses = useMemo(
    () => (licenses: CompanyLicenseFragment[]) => {
      setSelectedLicensesId(licenses.map((license) => license.id));
    },
    []
  );

  const company = data?.companies_by_pk;
  const settings = company?.settings;
  const clientSuccessTeamMember = settings?.client_success_user;
  const businessDevelopmentTeamMember = settings?.business_development_user;
  const underwritingTeamMember = settings?.underwriter_user;

  const contract = company?.contract as ContractFragment;
  const companyLicenses = company?.licenses || [];
  const featureFlagsPayload = settings?.feature_flags_payload || {};
  const customMessagesPayload = settings?.custom_messages_payload || {};
  const isDummyAccount = settings?.is_dummy_account || false;

  if (!company || !settings) {
    return null;
  }

  const isFeatureReportingRequirements = (featureFlag: string): boolean => {
    return (
      featureFlagsPayload.hasOwnProperty(
        FeatureFlagEnum.ReportingRequirementsCategory
      ) && featureFlag === FeatureFlagEnum.ReportingRequirementsCategory
    );
  };

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
            <strong>Bespoke Financial Bank Accounts</strong>
          </Typography>
          <Typography variant="body2">
            BF Advances Bank Account: BF bank account that BF sends advances
            from.
          </Typography>
          <Typography variant="body2">
            BF Repayments Bank Account: BF bank account that customer should
            send repayments to.
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
          <Typography variant="h5">Licenses</Typography>
          <Box display="flex" flexDirection="row-reverse">
            <Box mr={2}>
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
            <Box mr={2}>
              <ModalButton
                isDisabled={selectedLicensesId.length !== 1}
                label={"Delete License"}
                variant={"outlined"}
                modal={({ handleClose }) => (
                  <DeleteLicenseModal
                    licenseId={selectedLicensesId[0]}
                    handleClose={() => {
                      refetch();
                      handleClose();
                    }}
                  />
                )}
              />
            </Box>
          </Box>
          <Box display="flex" mt={3} data-cy="company-license-table-container">
            <CompanyLicensesDataGrid
              selectedCompanyLicensesIds={selectedLicensesId}
              handleSelectCompanyLicenses={handleSelectLicenses}
              companyLicenses={companyLicenses}
            />
          </Box>
        </Box>
        <Box mt={4}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">
              <strong>Supported Features</strong>
            </Typography>
            <Box display="flex" flexDirection="row-reverse">
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
          </Box>
          <Box display="flex" flexDirection="column">
            <>
              {AllFeatureFlags.map((featureFlag) => (
                <Box key={featureFlag} mt={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        disabled
                        checked={
                          isFeatureReportingRequirements(featureFlag)
                            ? featureFlagsPayload[featureFlag] ===
                              ReportingRequirementsCategoryEnum.None
                              ? false
                              : true
                            : !!featureFlagsPayload[featureFlag]
                        }
                        color="primary"
                      />
                    }
                    label={getFeatureFlagName(featureFlag)}
                  />
                  <Box pl={2}>
                    <Typography variant="subtitle2" color="textSecondary">
                      {isFeatureReportingRequirements(featureFlag)
                        ? ReportingRequirementsCategoryToDescription[
                            featureFlagsPayload[
                              featureFlag
                            ] as ReportingRequirementsCategoryEnum
                          ]
                        : getFeatureFlagDescription(featureFlag)}
                    </Typography>
                  </Box>
                </Box>
              ))}
              <Box mt={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      disabled
                      checked={
                        settings.is_autogenerate_repayments_enabled || false
                      }
                      color="primary"
                    />
                  }
                  label={"Customer opted in to Auto-generated Repayments"}
                />
                <Box pl={2}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {
                      "If enabled, the platform will automatically generate repayments on a loan's maturity date. Bespoke may override this in the event of failed reverse drafts."
                    }
                  </Typography>
                </Box>
              </Box>
            </>
          </Box>
        </Box>
        <Box mt={4}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">
              <strong>Custom Messages</strong>
            </Typography>
            <Box display="flex" flexDirection="row-reverse">
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
          </Box>
          <Typography variant="body2" color="textSecondary">
            Custom messages are messages configured by a bank user that are
            shown to the customer. The name / type of the custom message
            indicates where the message will be shown. You may leave the value
            of a custom message blank, in which case no message will be shown to
            the customer.
          </Typography>
          <Box display="flex" flexDirection="column">
            {AllCustomMessages.map((customMessage) => (
              <Box key={customMessage} mt={2}>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    <strong>{getCustomMessageName(customMessage)}</strong>
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
        <Box mt={4}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">
              <strong>Deal Owner</strong>
            </Typography>
            <Box display="flex" flexDirection="row-reverse">
              <ModalButton
                label={"Edit Deal Owners"}
                modal={({ handleClose }) => (
                  <UpsertDealOwnersModal
                    companySettingsId={settings.id}
                    underwriterUserId={settings.underwriter_user_id}
                    businessDevelopmentUserId={
                      settings.business_development_user_id
                    }
                    clientSuccessUserId={settings.client_success_user_id}
                    handleClose={() => {
                      refetch();
                      handleClose();
                    }}
                  />
                )}
              />
            </Box>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Underwriting Team Member
              </Typography>
              {underwritingTeamMember?.full_name || "None"}
            </Box>
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Business Development Team Member
              </Typography>
              {businessDevelopmentTeamMember?.full_name || "None"}
            </Box>
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Client Success Team Member
              </Typography>
              {clientSuccessTeamMember?.full_name || "None"}
            </Box>
          </Box>
        </Box>
        <Box mt={4}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">
              <strong>2FA Method</strong>
            </Typography>
            <Box display="flex" flexDirection="row-reverse">
              <ModalButton
                label={"Edit 2FA Method"}
                modal={({ handleClose }) => (
                  <UpdateThirdPartyCompanySettingsModal
                    companySettingsId={settings.id}
                    handleClose={() => {
                      refetch();
                      handleClose();
                    }}
                  />
                )}
              />
            </Box>
          </Box>
          <Typography variant="body2" color="textSecondary">
            Which 2FA method will be used for vendor partnership related
            communication.
          </Typography>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              2FA Method
            </Typography>
            {!!settings.two_factor_message_method
              ? TwoFactorMessageMethodToLabel[
                  settings.two_factor_message_method as TwoFactorMessageMethodEnum
                ]
              : "None"}
          </Box>
        </Box>
        <Box mt={4}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">
              <strong>Is Dummy Account</strong>
            </Typography>
            <Box display="flex" flexDirection="row-reverse">
              <ModalButton
                label={"Change Dummy Account Status"}
                color={"primary"}
                modal={({ handleClose }) => (
                  <ChangeIsDummyAccountModal
                    companySettingsId={settings.id}
                    isDummyAccountInitially={isDummyAccount}
                    handleClose={() => {
                      refetch();
                      handleClose();
                    }}
                  />
                )}
              />
            </Box>
          </Box>
          <Typography variant="body2" color="textSecondary">
            Enabling "is dummy account" excludes this customer from all
            financial calculations.
          </Typography>
          {isDummyAccount ? (
            <Box mt={1}>
              <Alert severity="warning">
                This customer is set as a dummy account
              </Alert>
            </Box>
          ) : (
            <Box mt={1}>
              <Alert severity="info">
                This customer is NOT set as a dummy account
              </Alert>
            </Box>
          )}
        </Box>
      </Box>
    </PageContent>
  );
}
