import { Box, Typography } from "@material-ui/core";
import { GridValueFormatterParams } from "@material-ui/data-grid";
import Modal from "components/Shared/Modal/Modal";
import UsersDataGrid from "components/Users/UsersDataGrid";
import {
  Companies,
  CompanyVendorPartnerships,
  UserFragment,
  Users,
  useGetVendorPartnershipForContactsForCustomersQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { createChangeVendorContactsRequestMutation } from "lib/api/companies";
import { useMemo, useState } from "react";

interface Props {
  vendorPartnershipId: CompanyVendorPartnerships["id"];
  vendorId: Companies["id"];
  customerName: string;
  vendorName: string;
  handleClose: () => void;
  vendorContacts: UserFragment[];
  requestingCompanyId: Companies["id"];
}

export default function UpdateCustomerVendorContactsModal({
  vendorPartnershipId,
  vendorId,
  customerName,
  vendorName,
  handleClose,
  vendorContacts,
  requestingCompanyId,
}: Props) {
  const snackbar = useSnackbar();

  const [selectedUserIds, setSelectedUserIds] = useState<Users["id"]>([]);

  const { error } = useGetVendorPartnershipForContactsForCustomersQuery({
    fetchPolicy: "network-only",
    variables: {
      id: vendorPartnershipId,
    },
    onCompleted: (data) => {
      const existingSelectedUserIds = (data?.company_vendor_contacts || []).map(
        (vendorContact) => vendorContact.vendor_user_id
      );
      setSelectedUserIds(existingSelectedUserIds);
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const selectedContacts = useMemo(
    () =>
      vendorContacts.filter((user) => selectedUserIds.indexOf(user.id) >= 0),
    [selectedUserIds, vendorContacts]
  );

  const notSelectedContacts = useMemo(
    () => vendorContacts.filter((user) => selectedUserIds.indexOf(user.id) < 0),
    [selectedUserIds, vendorContacts]
  );

  const notSelectedUserIds = useMemo(
    () => notSelectedContacts.map((user) => user.id),
    [notSelectedContacts]
  );

  const selectedUsersActionItems = useMemo(
    () => [
      {
        key: "deselect-user",
        label: "Remove",
        handleClick: (params: GridValueFormatterParams) =>
          setSelectedUserIds(
            selectedUserIds.filter(
              (userId: Users["id"]) => userId !== params.row.data.id
            )
          ),
      },
    ],
    [selectedUserIds, setSelectedUserIds]
  );

  const notSelectedUsersActionItems = useMemo(
    () => [
      {
        key: "select-user",
        label: "Add",
        handleClick: (params: GridValueFormatterParams) =>
          setSelectedUserIds([...selectedUserIds, params.row.data.id]),
      },
    ],
    [selectedUserIds, setSelectedUserIds]
  );

  const [
    updatePartnershipContacts,
    { loading: isUpdatePartnershipContactsLoading },
  ] = useCustomMutation(createChangeVendorContactsRequestMutation);

  const handleClickSubmit = async () => {
    const response = await updatePartnershipContacts({
      variables: {
        requested_vendor_id: vendorId,
        new_users: selectedUserIds,
        delete_users: notSelectedUserIds,
        requesting_company_id: requestingCompanyId,
      },
    });

    if (response.status !== "OK") {
      snackbar.showError(
        `Could not update vendor contacts. Error: ${response.msg}`
      );
    } else {
      snackbar.showSuccess("Vendor contacts change requested.");
      handleClose();
    }
  };

  const isSubmitDisabled =
    isUpdatePartnershipContactsLoading || selectedUserIds.length <= 0;

  return (
    <Modal
      isPrimaryActionDisabled={isSubmitDisabled}
      title={"Select Vendor Contacts"}
      subtitle={`${vendorName} <> ${customerName}`}
      contentWidth={800}
      primaryActionText={"Submit Change Request"}
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
        <>
          <Box mt={4}>
            <Typography variant="body2">
              <strong>Selected vendor contacts</strong>
            </Typography>
            <UsersDataGrid
              pager={false}
              users={selectedContacts}
              actionItems={selectedUsersActionItems}
            />
          </Box>
          <Box mt={4}>
            <Typography variant="body2">
              <strong>Not selected vendor contacts</strong>
            </Typography>
            <UsersDataGrid
              pager={false}
              users={notSelectedContacts}
              actionItems={notSelectedUsersActionItems}
            />
          </Box>
        </>
      </Box>
    </Modal>
  );
}
