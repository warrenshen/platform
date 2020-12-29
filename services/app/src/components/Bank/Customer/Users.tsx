import { Button } from "@material-ui/core";
import { CustomerParams } from "components/CompanyProfile";
import InviteUserModal from "components/Shared/Users/InviteUserModal";
import ListUsers from "components/Shared/Users/ListUsers";
import { useListUsersByCompanyIdQuery } from "generated/graphql";
import { useState } from "react";
import { useParams } from "react-router-dom";

function Users() {
  const { companyId } = useParams<CustomerParams>();
  const [open, setOpen] = useState(false);
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
          handleClose={() => setOpen(false)}
        ></InviteUserModal>
      )}
      <Button onClick={() => setOpen(true)} variant="contained" color="primary">
        Invite User
      </Button>
      <ListUsers companyId={companyId} users={customerUsers?.users}></ListUsers>
    </>
  );
}

export default Users;
