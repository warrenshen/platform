import { Dialog, DialogContent, DialogTitle } from "@material-ui/core";
import AccountForm from "components/Shared/BankAccount/AccountForm";

interface Props {
  handleClose: () => void;
}

function BankAccountModal(props: Props) {
  return (
    <Dialog open onClose={props.handleClose} maxWidth="md">
      <DialogTitle>Add Bank Account</DialogTitle>
      <DialogContent>
        <AccountForm onCancel={props.handleClose}></AccountForm>
      </DialogContent>
    </Dialog>
  );
}
export default BankAccountModal;
