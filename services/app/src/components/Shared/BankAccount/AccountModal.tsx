import { Dialog, DialogContent, DialogTitle } from "@material-ui/core";
import AccountForm from "components/Shared/BankAccount/AccountForm";
import { BankAccountFragment, Companies } from "generated/graphql";

interface Props {
  handleClose: () => void;
  companyId?: Companies["id"];
  bankAccount?: BankAccountFragment;
}

function AccountModal(props: Props) {
  return (
    <Dialog open onClose={props.handleClose} maxWidth="md">
      <DialogTitle>
        {props.bankAccount ? "Update Bank Account" : "Add Bank Account"}
      </DialogTitle>
      <DialogContent>
        <AccountForm {...props} onCancel={props.handleClose}></AccountForm>
      </DialogContent>
    </Dialog>
  );
}
export default AccountModal;
