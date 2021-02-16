import { Box, Button } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import InviteUserModal from "components/Shared/Users/InviteUserModal";
import EditUserProfileModal from "components/Shared/Users/EditUserProfileModal";
import ListUsers from "components/Shared/Users/ListUsers";
import {
  useListUsersByCompanyIdQuery,
  UserFragment,
  UserRolesEnum,
} from "generated/graphql";
import { useState } from "react";
import { useParams } from "react-router-dom";

export interface CustomerParams {
  companyId: string;
}

function Users() {
  const { companyId } = useParams<CustomerParams>();
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState({} as UserFragment);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const { data: customerUsers } = useListUsersByCompanyIdQuery({
    variables: {
      companyId: companyId,
    },
  });

  return (
    <>
      {open && (
        <InviteUserModal
          companyId={companyId}
          userRole={UserRolesEnum.CompanyAdmin}
          handleClose={() => setOpen(false)}
        ></InviteUserModal>
      )}
      {isEditUserModalOpen && (
        <EditUserProfileModal
          userId={selectedUser.id}
          companyId={companyId}
          originalUserProfile={selectedUser}
          handleClose={() => setIsEditUserModalOpen(false)}
        ></EditUserProfileModal>
      )}
      <Box display="flex" flexDirection="row-reverse">
        <Button
          onClick={() => setOpen(true)}
          variant="contained"
          color="primary"
          style={{ marginBottom: "1rem" }}
        >
          Invite User
        </Button>
      </Box>
      <ListUsers
        actionItems={[
          {
            key: "edit-user-profile-modal",
            label: "Edit",
            handleClick: (params: ValueFormatterParams) => {
              setIsEditUserModalOpen(true);
              setSelectedUser(params.row.data);
            },
          },
        ]}
        hideCompany
        users={customerUsers?.users}
      ></ListUsers>
    </>
  );
}

export default Users;
