import { Box, Typography } from "@material-ui/core";
import Modal from "components/Shared/Modal/Modal";
import ModalButton from "components/Shared/Modal/ModalButton";
import EditUserProfileMiniModal from "components/Users/EditUserProfileMiniModal";
import UsersDataGrid from "components/Users/UsersDataGrid";
import UpdateCustomerVendorContactsModal from "components/Vendors/UpdateCustomerVendorContactsModal";
import {
  CompanyVendorPartnerships,
  useCompanyVendorPartnershipForCustomerQuery,
} from "generated/graphql";
import { useMemo, useState } from "react";

interface Props {
  vendorPartnershipId: CompanyVendorPartnerships["id"];
  handleClose: () => void;
}

export default function VendorPartnershipDrawer({
  vendorPartnershipId,
  handleClose,
}: Props) {
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);

  const { data, error, refetch } = useCompanyVendorPartnershipForCustomerQuery({
    fetchPolicy: "network-only",
    variables: {
      id: vendorPartnershipId,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const companyVendorPartnership = data?.company_vendor_partnerships[0];
  const customer = companyVendorPartnership?.company;

  const vendor = companyVendorPartnership?.vendor;
  const vendorContactUsers = useMemo(
    () =>
      companyVendorPartnership?.vendor_contacts.map(
        (vendorContact) => vendorContact.user
      ) || [],
    [companyVendorPartnership]
  );

  if (!companyVendorPartnership || !customer || !vendor) {
    return null;
  }

  return (
    <Modal
      title={`Edit Vendor Partnership`}
      subtitle={`${customer.name} (Customer) <> ${vendor.name} (Vendor)`}
      contentWidth={800}
      handleClose={handleClose}
    >
      {!!selectedUserProfile && (
        <EditUserProfileMiniModal
          userProfileId={selectedUserProfile}
          vendorId={vendor.id}
          requestingCompanyId={customer.id}
          handleClose={() => setSelectedUserProfile(null)}
        />
      )}
      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="h6">Vendor Contacts</Typography>
        <Typography variant="subtitle2">
          Specify which vendor contacts will receive notifications for this
          partnership.
        </Typography>
        <Box mt={2}>
          <ModalButton
            label={"Assign Vendor Contacts"}
            color="default"
            size="small"
            variant="outlined"
            modal={({ handleClose }) => (
              <UpdateCustomerVendorContactsModal
                vendorPartnershipId={vendorPartnershipId}
                vendorId={vendor.id}
                requestingCompanyId={customer.id}
                customerName={customer.name}
                vendorName={vendor.name || ""}
                vendorContactUsers={vendorContactUsers}
                handleClose={() => {
                  refetch();
                  handleClose();
                }}
              />
            )}
          />
        </Box>
        <UsersDataGrid
          isEditIconVisible={true}
          users={vendorContactUsers}
          setSelectedUserProfile={setSelectedUserProfile}
        />
      </Box>
    </Modal>
  );
}
