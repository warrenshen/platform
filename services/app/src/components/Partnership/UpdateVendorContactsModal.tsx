import { Box, Typography } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import Modal from "components/Shared/Modal/Modal";
import UsersDataGrid from "components/Users/UsersDataGrid";
import {
  CompanyVendorContactFragment,
  CompanyVendorPartnerships,
  UserFragment,
  Users,
  useGetVendorPartnershipForContactsQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { updatePartnershipContactsMutation } from "lib/api/partnerships";
import { useMemo, useState } from "react";

interface Props {
  vendorPartnershipId: CompanyVendorPartnerships["id"];
  handleClose: () => void;
}

export default function UpdateVendorContactsModal({
  vendorPartnershipId,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  const [selectedUserIds, setSelectedUserIds] = useState<Users["id"]>([]);

  const { data, error } = useGetVendorPartnershipForContactsQuery({
    fetchPolicy: "network-only",
    variables: {
      id: vendorPartnershipId,
    },
    onCompleted: (data) => {
      const existingSelectedUserIds = (
        data?.company_vendor_partnerships_by_pk?.vendor_contacts || []
      ).map(
        (vendorContact: CompanyVendorContactFragment) =>
          vendorContact.vendor_user_id
      );
      setSelectedUserIds(existingSelectedUserIds);
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const customer = data?.company_vendor_partnerships_by_pk?.company;
  const vendor = data?.company_vendor_partnerships_by_pk?.vendor;

  const users: UserFragment[] = useMemo(
    () => data?.company_vendor_partnerships_by_pk?.vendor?.users || [],
    [data?.company_vendor_partnerships_by_pk]
  );

  const selectedContacts = useMemo(
    () => users.filter((user) => selectedUserIds.indexOf(user.id) >= 0),
    [selectedUserIds, users]
  );

  const notSelectedContacts = useMemo(
    () => users.filter((user) => selectedUserIds.indexOf(user.id) < 0),
    [selectedUserIds, users]
  );

  const selectedLoansActionItems = useMemo(
    () => [
      {
        key: "deselect-user",
        label: "Remove",
        handleClick: (params: ValueFormatterParams) =>
          setSelectedUserIds(
            selectedUserIds.filter(
              (userId: Users["id"]) => userId !== params.row.data.id
            )
          ),
      },
    ],
    [selectedUserIds, setSelectedUserIds]
  );

  const notSelectedLoansActionItems = useMemo(
    () => [
      {
        key: "select-user",
        label: "Add",
        handleClick: (params: ValueFormatterParams) =>
          setSelectedUserIds([...selectedUserIds, params.row.data.id]),
      },
    ],
    [selectedUserIds, setSelectedUserIds]
  );

  const handleClickSubmit = async () => {
    const response = await updatePartnershipContacts({
      variables: {
        is_payor: false,
        partnership_id: vendorPartnershipId,
        user_ids: selectedUserIds,
      },
    });

    if (response.status !== "OK") {
      snackbar.showError(
        `Could not update vendor contacts. Error: ${response.msg}`
      );
    } else {
      snackbar.showSuccess("Vendor contacts updated.");
      handleClose();
    }
  };

  const [
    updatePartnershipContacts,
    { loading: isUpdatePartnershipContactsLoading },
  ] = useCustomMutation(updatePartnershipContactsMutation);

  if (!customer || !vendor) {
    return null;
  }

  const isSubmitDisabled =
    isUpdatePartnershipContactsLoading || selectedUserIds.length <= 0;

  return (
    <Modal
      isPrimaryActionDisabled={isSubmitDisabled}
      title={"Select Vendor Contacts"}
      subtitle={`${vendor.name} <> ${customer.name}`}
      contentWidth={800}
      primaryActionText={"Save"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickSubmit}
    >
      <Box display="flex" flexDirection="column" mt={4}>
        <Box>
          <Typography variant="subtitle1">
            Specify vendor contacts whom will receive notifications for this
            partnership.
          </Typography>
        </Box>
        <Box mt={4}>
          <Typography variant="body2">
            <strong>Selected vendor contacts</strong>
          </Typography>
          <UsersDataGrid
            pager={false}
            users={selectedContacts}
            actionItems={selectedLoansActionItems}
          />
        </Box>
        <Box mt={4}>
          <Typography variant="body2">
            <strong>Not selected vendor contacts</strong>
          </Typography>
          <UsersDataGrid
            pager={false}
            users={notSelectedContacts}
            actionItems={notSelectedLoansActionItems}
          />
        </Box>
      </Box>
    </Modal>
  );
}
