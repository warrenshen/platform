import { Button } from "@material-ui/core";
import RegisterPayorModal from "components/Payors/RegisterPayorModal";
import Can from "components/Shared/Can";
import { Action } from "lib/auth/rbac-rules";
import { useState } from "react";

export default function AddPayorButton() {
  const [open, setOpen] = useState(false);

  return (
    <Can perform={Action.AddPayor}>
      {open && <RegisterPayorModal handleClose={() => setOpen(false)} />}
      <Button onClick={() => setOpen(true)} color="primary" variant="contained">
        Add Payor
      </Button>
    </Can>
  );
}
