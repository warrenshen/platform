import {
  Box,
  createStyles,
  Drawer,
  Grid,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import * as Sentry from "@sentry/react";
import Can from "components/Shared/Can";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import FileUploadDropzone from "components/Shared/File/FileUploadDropzone";
import ModalButton from "components/Shared/Modal/ModalButton";
import ContactsList from "components/ThirdParties/ContactsList";
import UpdateCompanyLicensesModal from "components/ThirdParties/UpdateCompanyLicensesModal";
import UpdateThirdPartyCompanySettingsModal from "components/ThirdParties/UpdateThirdPartyCompanySettingsModal";
import ApproveVendor from "components/Vendors/VendorDrawer/Actions/ApproveVendor";
import BankAccount from "components/Vendors/VendorDrawer/BankAccount";
import VendorInfo from "components/Vendors/VendorDrawer/VendorInfo";
import {
  CompanyAgreementsInsertInput,
  useAddCompanyVendorAgreementMutation,
  useGetVendorPartnershipForBankQuery,
  useUpdateVendorAgreementIdMutation,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import { Action } from "lib/auth/rbac-rules";
import {
  FileTypeEnum,
  TwoFactorMessageMethodEnum,
  TwoFactorMessageMethodToLabel,
} from "lib/enum";
import { InventoryNotifier } from "lib/notifications/inventory";
import { omit } from "lodash";
import { useMemo } from "react";
import SendVendorAgreements from "./VendorDrawer/Notifications/SendVendorAgreements";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawerContent: {
      width: 700,
      paddingBottom: theme.spacing(16),
    },
    propertyLabel: {
      flexGrow: 1,
    },
  })
);

interface Props {
  vendorPartnershipId: string;
  onClose: () => void;
}

function VendorDrawer({ vendorPartnershipId, onClose }: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  const {
    data,
    loading: isBankVendorPartnershipLoading,
    error,
    refetch,
  } = useGetVendorPartnershipForBankQuery({
    variables: {
      id: vendorPartnershipId,
    },
  });

  const [updateVendorAgreementId] = useUpdateVendorAgreementIdMutation();
  const [addCompanyVendorAgreement] = useAddCompanyVendorAgreementMutation();

  const agreementFileId =
    data?.company_vendor_partnerships_by_pk?.vendor_agreement?.file_id;

  const agreementFileIds = useMemo(() => {
    return agreementFileId ? [agreementFileId] : [];
  }, [agreementFileId]);

  if (!data?.company_vendor_partnerships_by_pk) {
    if (!isBankVendorPartnershipLoading) {
      let msg = `Error querying for the bank vendor partner ${vendorPartnershipId}. Error: ${error}`;
      window.console.log(msg);
      Sentry.captureMessage(msg);
    }
    return null;
  }

  const customer = data.company_vendor_partnerships_by_pk.company;
  const vendor = data.company_vendor_partnerships_by_pk.vendor;

  const customerName = customer?.name;
  const companyLicenses = vendor.licenses || [];

  const notifier = new InventoryNotifier();
  const isVendorBankAccountValid = !!data.company_vendor_partnerships_by_pk
    .vendor_bank_account;
  const hasNoContactsSetup =
    !vendor.users ||
    vendor.users.length === 0 ||
    !customer?.users ||
    customer.users.length === 0;

  return (
    <Drawer open anchor="right" onClose={onClose}>
      <Box className={classes.drawerContent} p={4}>
        <Typography variant="h6">{vendor.name}</Typography>
        <Box py={3}>
          <VendorInfo vendor={omit(vendor, ["users"])} />
        </Box>
        <Typography variant="h6">Contacts</Typography>
        <ContactsList
          isPayor={false}
          companyId={vendor.id}
          contacts={vendor.users}
          handleDataChange={refetch}
        />
        <Typography variant="h6">Bank Information</Typography>
        {!isVendorBankAccountValid && (
          <Typography variant="body2" color="secondary">
            Warning: vendor bank account NOT configured yet.
          </Typography>
        )}
        <Typography variant="subtitle2">
          Specify which bank account Bespoke Financial will send advances to:
        </Typography>
        <Box display="flex" mt={1}>
          <BankAccount
            companyId={vendor.id}
            companyVendorPartnershipId={
              data.company_vendor_partnerships_by_pk.id
            }
            bankAccount={
              data.company_vendor_partnerships_by_pk.vendor_bank_account
            }
          />
        </Box>
        <Box display="flex" flexDirection="column">
          <Grid item>
            <Typography variant="h6">Licenses</Typography>
          </Grid>
          <Box mt={1} mb={1}>
            <ModalButton
              label={"Edit Licenses"}
              color="default"
              variant="outlined"
              modal={({ handleClose }) => (
                <UpdateCompanyLicensesModal
                  companyId={vendor.id}
                  handleClose={() => {
                    refetch();
                    handleClose();
                  }}
                />
              )}
            />
          </Box>
          <Box mt={1} mb={2}>
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
        </Box>
        <Box display="flex" flexDirection="column">
          <Grid item>
            <Typography variant="h6">Vendor Agreement</Typography>
          </Grid>
          {agreementFileId && (
            <Grid item>
              <DownloadThumbnail
                fileIds={agreementFileIds}
                fileType={FileTypeEnum.COMPANY_AGREEMENT}
              />
            </Grid>
          )}
          <Box mt={1} mb={2}>
            <FileUploadDropzone
              companyId={vendor.id}
              docType="vendor_agreement"
              maxFilesAllowed={1}
              onUploadComplete={async (resp) => {
                if (!resp.succeeded) {
                  return;
                }
                const fileId = resp.files_in_db[0].id;
                // This is an agreement that the vendor signs with Bespoke, therefore
                // company_id is vendor.id
                const agreement: CompanyAgreementsInsertInput = {
                  file_id: fileId,
                  company_id: vendor.id,
                };
                const companyAgreement = await addCompanyVendorAgreement({
                  variables: {
                    vendorAgreement: agreement,
                  },
                });
                const vendorAgreementId =
                  companyAgreement.data?.insert_company_agreements_one?.id;
                const response = await updateVendorAgreementId({
                  variables: {
                    companyVendorPartnershipId: vendorPartnershipId,
                    vendorAgreementId: vendorAgreementId,
                  },
                });
                if (response.data?.update_company_vendor_partnerships_by_pk) {
                  refetch();
                  snackbar.showSuccess("Vendor agreement uploaded.");
                } else {
                  snackbar.showError(
                    "Error! Vendor agreement could not be uploaded."
                  );
                }
              }}
            />
          </Box>
        </Box>
        <Typography variant="h6">Notifications</Typography>
        <Can perform={Action.SendVendorAgreements}>
          <Box mt={1} mb={2}>
            <SendVendorAgreements
              vendorId={vendor.id}
              vendorName={vendor.name}
              customerName={customerName}
              customerId={customer.id}
              notifier={notifier}
            />
          </Box>
        </Can>
        <Typography variant="h6">Actions</Typography>
        <Can perform={Action.ApproveVendor}>
          <Box mt={1} mb={2}>
            <ApproveVendor
              hasNoContactsSetup={hasNoContactsSetup}
              vendorId={vendor.id}
              customerId={customer.id}
              vendorPartnershipId={vendorPartnershipId}
              customerName={customerName}
              vendorName={vendor.name}
              notifier={notifier}
            />
          </Box>
        </Can>
        <Typography variant="h6">Settings</Typography>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            2FA Method
          </Typography>
          {!!vendor.settings?.two_factor_message_method
            ? TwoFactorMessageMethodToLabel[
                vendor.settings
                  ?.two_factor_message_method as TwoFactorMessageMethodEnum
              ]
            : "None"}
        </Box>
        <Box mt={2}>
          <ModalButton
            label={"Edit 2FA"}
            color="default"
            variant="outlined"
            modal={({ handleClose }) => (
              <UpdateThirdPartyCompanySettingsModal
                companySettingsId={vendor.settings?.id}
                handleClose={() => {
                  refetch();
                  handleClose();
                }}
              />
            )}
          />
        </Box>
      </Box>
    </Drawer>
  );
}

export default VendorDrawer;
