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
import UpdateThirdPartyCompanySettingsModal from "components/ThirdParties/UpdateThirdPartyCompanySettingsModal";
import ApproveVendor from "components/Vendors/VendorDrawer/Actions/ApproveVendor";
import BankAccount from "components/Vendors/VendorDrawer/BankAccount";
import VendorInfo from "components/Vendors/VendorDrawer/VendorInfo";
import {
  CompanyAgreementsInsertInput,
  CompanyLicensesInsertInput,
  useAddCompanyVendorAgreementMutation,
  useAddCompanyVendorLicenseMutation,
  useGetVendorPartnershipForBankQuery,
  useUpdateVendorAgreementIdMutation,
  useUpdateVendorLicenseIdMutation,
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

  const [updateVendorLicenseId] = useUpdateVendorLicenseIdMutation();
  const [addVendorLicense] = useAddCompanyVendorLicenseMutation();

  const agreementFileId =
    data?.company_vendor_partnerships_by_pk?.company_agreement?.file_id;
  const licenseFileId =
    data?.company_vendor_partnerships_by_pk?.company_license?.file_id;

  const agreementFileIds = useMemo(() => {
    return agreementFileId ? [agreementFileId] : [];
  }, [agreementFileId]);
  const licenseFileIds = useMemo(() => {
    return licenseFileId ? [licenseFileId] : [];
  }, [licenseFileId]);

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

  const notifier = new InventoryNotifier();
  const hasNoContactsSetup = !vendor.users || !customer?.users;

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
        <Box flexDirection="column">
          <Grid item>
            <Typography variant="h6">Licenses</Typography>
          </Grid>
          {licenseFileId && (
            <Grid item>
              <DownloadThumbnail
                fileIds={licenseFileIds}
                fileType={FileTypeEnum.COMPANY_LICENSE}
              />
            </Grid>
          )}
          <Box mt={1} mb={2}>
            <FileUploadDropzone
              companyId={vendor.id}
              docType="vendor_license"
              maxFilesAllowed={1}
              onUploadComplete={async (resp) => {
                if (!resp.succeeded) {
                  return;
                }
                const fileId = resp.files_in_db[0].id;
                // This is an agreement that the vendor signs with Bespoke, therefore
                // company_id is vendor.id
                const license: CompanyLicensesInsertInput = {
                  file_id: fileId,
                  company_id: vendor.id,
                };
                const vendorLicense = await addVendorLicense({
                  variables: {
                    vendorLicense: license,
                  },
                });
                const vendorLicenseId =
                  vendorLicense.data?.insert_company_licenses_one?.id;
                const response = await updateVendorLicenseId({
                  variables: {
                    companyVendorPartnershipId: vendorPartnershipId,
                    vendorLicenseId: vendorLicenseId,
                  },
                });
                if (response.data?.update_company_vendor_partnerships_by_pk) {
                  refetch();
                  snackbar.showSuccess("Vendor license uploaded.");
                } else {
                  snackbar.showError(
                    "Error! Vendor license could not be uploaded."
                  );
                }
              }}
            />
          </Box>
        </Box>
        <Box flexDirection="column">
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
          {!!vendor.settings.two_factor_message_method
            ? TwoFactorMessageMethodToLabel[
                vendor.settings
                  .two_factor_message_method as TwoFactorMessageMethodEnum
              ]
            : "None"}
        </Box>
        <Box mt={2}>
          <ModalButton
            label={"Edit"}
            color="default"
            variant="outlined"
            modal={({ handleClose }) => (
              <UpdateThirdPartyCompanySettingsModal
                companySettingsId={vendor.settings.id}
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
