import { Box, Typography } from "@material-ui/core";
import { GridValueFormatterParams } from "@material-ui/data-grid";
import Modal from "components/Shared/Modal/Modal";
import UsersDataGrid from "components/Users/UsersDataGrid";
import {
  Companies,
  CompanyVendorPartnerships,
  UserFragment,
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
  activeContactUsers: UserFragment[];
  inactiveContactUsers: UserFragment[];
  requestingCompanyId: Companies["id"];
}

export default function UpdateCustomerVendorContactsModal({
  vendorPartnershipId,
  vendorId,
  customerName,
  vendorName,
  handleClose,
  activeContactUsers,
  inactiveContactUsers,
  requestingCompanyId,
}: Props) {
  const snackbar = useSnackbar();

  const [activeUsers, setActiveUsers] = useState<UserFragment[]>([]);
  const [inactiveUsers, setInactiveUsers] = useState<UserFragment[]>([]);

  useMemo(() => {
    setActiveUsers(activeContactUsers);
    setInactiveUsers(inactiveContactUsers);
  }, [activeContactUsers, inactiveContactUsers]);

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

  const [
    updatePartnershipContacts,
    { loading: isUpdatePartnershipContactsLoading },
  ] = useCustomMutation(createChangeVendorContactsRequestMutation);

  const handleClickSubmit = async () => {
    const response = await updatePartnershipContacts({
      variables: {
        requested_vendor_id: vendorId,
        active_user_ids: activeUsers.map((user) => user.id),
        inactive_user_ids: inactiveUsers.map((user) => user.id),
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
    isUpdatePartnershipContactsLoading || activeUsers.length <= 0;

  return (
    <Modal
      isPrimaryActionDisabled={isSubmitDisabled}
      title={"Select Vendor Contacts"}
      subtitle={`${customerName} (Customer) <> ${vendorName} (Vendor)`}
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
        </>
      </Box>
    </Modal>
  );
}
