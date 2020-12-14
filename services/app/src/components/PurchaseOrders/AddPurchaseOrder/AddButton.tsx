import { Button } from "@material-ui/core";
import AddPurchaseOrderModal from "./AddPurchaseOrderModal";

interface Props {
  id: string;
  open: boolean;
  setOpen: (arg0: boolean) => void;
  clearId: () => void;
}

function AddButton({ id, open, setOpen, clearId }: Props) {
  return (
    <>
      {open && (
        <AddPurchaseOrderModal
          id={id}
          handleClose={() => setOpen(false)}
        ></AddPurchaseOrderModal>
      )}
      <Button
        onClick={() => {
          clearId();
          setOpen(true);
        }}
        color="primary"
      >
        Add Purchase Order
      </Button>
    </>
  );
}

export default AddButton;
