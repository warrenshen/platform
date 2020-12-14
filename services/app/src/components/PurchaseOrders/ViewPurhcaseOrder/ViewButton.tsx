import { Button } from "@material-ui/core";
import { useState } from "react";
import ViewModal from "./ViewModal";

interface Props {
  id: string;
  name: string;
}

function ViewButton({ id, name }: Props) {
  const [open, setOpen] = useState(false);
  const handleReplica = () => {};

  return (
    <>
      {open && (
        <ViewModal
          createPurchaseOrderReplica={handleReplica}
          id={id}
          handleClose={() => setOpen(false)}
        ></ViewModal>
      )}
      <Button onClick={() => setOpen(true)} color="primary">
        {name}
      </Button>
    </>
  );
}

export default ViewButton;
