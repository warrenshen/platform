import { Box, Typography } from "@material-ui/core";
import { GridValueFormatterParams } from "@material-ui/data-grid";
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
  activeContactUsers: UserFragment[];
  inactiveContactUsers: UserFragment[];
  handleClose: () => void;
}

export default function UpdateVendorContactsModal({
  vendorPartnershipId,
  activeContactUsers,
  inactiveContactUsers,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  const [selectedUserIds, setSelectedUserIds] = useState<Users["id"]>([]);
  const [activeUsers, setActiveUsers] = useState<UserFragment[]>([]);
  const [inactiveUsers, setInactiveUsers] = useState<UserFragment[]>([]);

  useMemo(() => {
    setActiveUsers(activeContactUsers);
    setInactiveUsers(inactiveContactUsers);
  }, [activeContactUsers, inactiveContactUsers]);

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

  const selectedUsersActionItems = useMemo(
    () => [
      {
        key: "deselect-user",
        label: "Remove",
        handleClick: (params: GridValueFormatterParams) => {
          const targetUser = activeUsers.filter(
            (user) => user.id === params.row.data.id
          )[0];
          setInactiveUsers([...inactiveUsers, targetUser]);
          setActiveUsers(
            activeUsers.filter((user) => user.id !== params.row.data.id)
          );
        },
      },
    ],
    [activeUsers, inactiveUsers]
  );

  const notSelectedUsersActionItems = useMemo(
    () => [
      {
        key: "select-user",
        label: "Add",
        handleClick: (params: GridValueFormatterParams) => {
          const targetUser = inactiveUsers.filter(
            (user) => user.id === params.row.data.id
          )[0];
          setActiveUsers([...activeUsers, targetUser]);
          setInactiveUsers(
            inactiveUsers.filter((user) => user.id !== params.row.data.id)
          );
        },
      },
    ],
    [activeUsers, inactiveUsers]
  );

  const handleClickSubmit = async () => {
    const response = await updatePartnershipContacts({
      variables: {
        is_payor: false,
        partnership_id: vendorPartnershipId,
        user_ids: activeUsers.map((user) => user.id),
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
      subtitle={`${customer.name} (Customer) <> ${vendor.name} (Vendor)`}
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
            users={activeUsers}
            actionItems={selectedUsersActionItems}
          />
        </Box>
        <Box mt={4}>
          <Typography variant="body2">
            <strong>Not selected vendor contacts</strong>
          </Typography>
          <UsersDataGrid
            pager={false}
            users={inactiveUsers}
            actionItems={notSelectedUsersActionItems}
          />
        </Box>
      </Box>
    </Modal>
  );
}
