import { Button } from "@material-ui/core";
import AddLoanModal from "./AddLoanModal";

interface Props {
  open: boolean;
  setOpen: (arg0: boolean) => void;
}

function AddButton({ open, setOpen }: Props) {
  return (
    <>
      {open && <AddLoanModal handleClose={() => setOpen(false)}></AddLoanModal>}
      <Button
        onClick={() => {
          setOpen(true);
        }}
        variant="contained"
        color="primary"
      >
        Add Loan
      </Button>
    </>
  );
}

export default AddButton;
