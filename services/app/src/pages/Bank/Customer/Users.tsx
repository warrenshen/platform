import { Box, Button } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import EditUserProfileModal from "components/Users/EditUserProfileModal";
import InviteUserModal from "components/Users/InviteUserModal";
import UsersDataGrid from "components/Users/UsersDataGrid";
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
  const { data: customerUsers, refetch } = useListUsersByCompanyIdQuery({
    variables: {
      companyId: companyId,
    },
  });

  return (
    <>
      {open && (
        <InviteUserModal
          companyId={companyId}
          userRoles={[
            UserRolesEnum.CompanyAdmin,
            UserRolesEnum.CompanyReadOnly,
          ]}
          handleClose={() => {
            refetch();
            setOpen(false);
          }}
        />
      )}
      {isEditUserModalOpen && (
        <EditUserProfileModal
          userId={selectedUser.id}
          companyId={companyId}
          originalUserProfile={selectedUser}
          handleClose={() => setIsEditUserModalOpen(false)}
        />
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
      <UsersDataGrid
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
      />
    </>
  );
}

export default Users;
