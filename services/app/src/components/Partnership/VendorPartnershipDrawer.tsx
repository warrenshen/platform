import { Box, Grid, Typography } from "@material-ui/core";
import UpdateVendorContactsModal from "components/Partnership/UpdateVendorContactsModal";
import Can from "components/Shared/Can";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import FileUploadDropzone from "components/Shared/File/FileUploadDropzone";
import Modal from "components/Shared/Modal/Modal";
import ModalButton from "components/Shared/Modal/ModalButton";
import UsersDataGrid from "components/Users/UsersDataGrid";
import ApproveVendor from "components/Vendors/VendorDrawer/Actions/ApproveVendor";
import BankAccount from "components/Vendors/VendorDrawer/BankAccount";
import SendVendorAgreements from "components/Vendors/VendorDrawer/Notifications/SendVendorAgreements";
import {
  CompanyAgreementsInsertInput,
  CompanyVendorPartnerships,
  UserFragment,
  useAddCompanyVendorAgreementMutation,
  useGetVendorPartnershipForBankQuery,
  useUpdateVendorAgreementIdMutation,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import { Action } from "lib/auth/rbac-rules";
import { FileTypeEnum } from "lib/enum";
import { InventoryNotifier } from "lib/notifications/inventory";
import { consolidateCompanyUsers } from "lib/users";
import { useMemo } from "react";

interface Props {
  vendorPartnershipId: CompanyVendorPartnerships["id"];
  handleClose: () => void;
}

export default function VendorPartnershipDrawer({
  vendorPartnershipId,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  const { data, error, refetch } = useGetVendorPartnershipForBankQuery({
    fetchPolicy: "network-only",
    variables: {
      id: vendorPartnershipId,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const [updateVendorAgreementId] = useUpdateVendorAgreementIdMutation();
  const [addCompanyVendorAgreement] = useAddCompanyVendorAgreementMutation();

  const companyVendorPartnership = data?.company_vendor_partnerships_by_pk;
  const { activeContactUsers, inactiveContactUsers } = useMemo(() => {
    const active = !!companyVendorPartnership?.vendor_contacts
      ? companyVendorPartnership.vendor_contacts
          .filter((contact) => contact.is_active === true)
          .map((contact) => contact.user)
      : ([] as UserFragment[]);

    const inactive = !!companyVendorPartnership?.vendor_contacts
      ? companyVendorPartnership.vendor_contacts
          .filter((contact) => contact.is_active !== true)
          .map((contact) => contact.user)
      : ([] as UserFragment[]);

    return {
      activeContactUsers: active,
      inactiveContactUsers: inactive,
    };
  }, [companyVendorPartnership]);

  const customer = companyVendorPartnership?.company;
  const customerUsers = consolidateCompanyUsers(
    customer?.users || [],
    customer?.parent_company?.users || []
  );
  const vendor = companyVendorPartnership?.vendor;
  const agreementFileId = companyVendorPartnership?.vendor_agreement?.file_id;

  const agreementFileIds = useMemo(() => {
    return agreementFileId ? [agreementFileId] : [];
  }, [agreementFileId]);

  if (!companyVendorPartnership || !customer || !vendor) {
    return null;
  }

  const customerName = customer.name;

  const notifier = new InventoryNotifier();
  const isVendorBankAccountValid =
    !!companyVendorPartnership?.vendor_bank_account;
  const hasNoContactsSetup =
    !vendor.users || vendor?.users.length === 0 || customerUsers.length === 0;

  return (
    <Modal
      title={`Customer Vendor Partnership`}
      subtitle={`${customer.name} (Customer) <> ${vendor.name} (Vendor)`}
      contentWidth={800}
      handleClose={handleClose}
    >
      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="h6">Vendor Contacts</Typography>
        <Typography variant="subtitle2">
          Specify which vendor contacts will receive notifications for this
          partnership.
        </Typography>
        <Box mt={2}>
          <ModalButton
            label={"Edit Vendor Contacts"}
            color="default"
            size="small"
            variant="outlined"
            modal={({ handleClose }) => (
              <UpdateVendorContactsModal
                vendorPartnershipId={vendorPartnershipId}
                activeContactUsers={activeContactUsers}
                inactiveContactUsers={inactiveContactUsers}
                handleClose={() => {
                  refetch();
                  handleClose();
                }}
              />
            )}
          />
        </Box>
        <UsersDataGrid users={activeContactUsers} />
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="h6">Bank Information</Typography>
        {!isVendorBankAccountValid && (
          <Typography variant="body2" color="secondary">
            Warning: vendor bank account to send advances to NOT assigned yet.
          </Typography>
        )}
        <Typography variant="subtitle2">
          Specify which bank account Bespoke Financial will send advances to:
        </Typography>
        <Box display="flex" mt={1}>
          <BankAccount
            companyId={vendor.id}
            companyVendorPartnershipId={companyVendorPartnership.id}
            bankAccount={companyVendorPartnership.vendor_bank_account}
            handleDataChange={refetch}
          />
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <Grid item>
          <Typography variant="h6">Vendor Agreement</Typography>
        </Grid>
        {agreementFileId && (
          <Grid item>
            <DownloadThumbnail
              fileIds={agreementFileIds}
              fileType={FileTypeEnum.CompnayAgreement}
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
      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="h6">Notifications</Typography>
        <Can perform={Action.SendVendorAgreements}>
          <Box mt={1} mb={2}>
            <SendVendorAgreements
              vendorId={vendor.id}
              vendorName={vendor.name || ""}
              customerName={customerName}
              customerId={customer.id}
              notifier={notifier}
            />
          </Box>
        </Can>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="h6">Actions</Typography>
        <Can perform={Action.ApproveVendor}>
          <Box mt={1} mb={2}>
            <ApproveVendor
              hasNoContactsSetup={hasNoContactsSetup}
              vendorId={vendor.id}
              customerId={customer.id}
              vendorPartnershipId={vendorPartnershipId}
              customerName={customerName}
              vendorName={vendor.name || ""}
              notifier={notifier}
            />
          </Box>
        </Can>
      </Box>
    </Modal>
  );
}
