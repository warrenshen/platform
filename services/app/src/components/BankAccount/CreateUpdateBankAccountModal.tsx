import {
  createStyles,
  Dialog,
  DialogContent,
  DialogTitle,
  makeStyles,
  Theme,
} from "@material-ui/core";
import { BankAccountFragment, Companies } from "generated/graphql";
import BankAccountForm from "./BankAccountForm";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 400,
    },
    dialogTitle: {
      borderBottom: "1px solid #c7c7c7",
    },
  })
);

interface Props {
  companyId: Companies["id"] | null;
  existingBankAccount: BankAccountFragment | null;
  handleClose: () => void;
}

function CreateUpdateBankAccountModal({
  companyId,
  existingBankAccount,
  handleClose,
}: Props) {
  const classes = useStyles();

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="xl"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle>
        {existingBankAccount ? "Update Bank Account" : "Add Bank Account"}
      </DialogTitle>
      <DialogContent>
        <BankAccountForm
          companyId={companyId}
          existingBankAccount={existingBankAccount}
          onCancel={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}
export default CreateUpdateBankAccountModal;
