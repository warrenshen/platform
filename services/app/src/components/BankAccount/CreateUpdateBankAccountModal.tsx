import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogContent,
  DialogTitle,
  makeStyles,
  Theme,
} from "@material-ui/core";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  BankAccountFragment,
  BankAccountsInsertInput,
  Companies,
  useAddBankAccountMutation,
  UserRolesEnum,
  useUpdateBankAccountMutation,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import { isNull, mergeWith } from "lodash";
import { useContext, useMemo, useState } from "react";
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

  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const snackbar = useSnackbar();

  // Default BankAccount for CREATE case.
  const newBankAccount = useMemo(
    () =>
      ({
        company_id: companyId,
        bank_name: "",
        account_title: "",
        account_type: "",
        routing_number: "",
        account_number: "",
        can_ach: false,
        can_wire: false,
        bank_address: "",
        recipient_name: "",
        recipient_address: "",
        verified_at: null,
        verified_date: null,
        is_cannabis_compliant: false,
      } as BankAccountsInsertInput),
    [companyId]
  );

  const [bankAccount, setBankAccount] = useState(
    mergeWith(
      newBankAccount,
      existingBankAccount as BankAccountsInsertInput,
      (a, b) => (isNull(b) ? a : b)
    )
  );

  const handleUpdateBankAccount = async () => {
    await updateBankAccount({
      variables: {
        id: bankAccount.id,
        bankAccount: {
          bank_name: bankAccount.bank_name,
          account_title: bankAccount.account_title,
          account_type: bankAccount.account_type,
          account_number: bankAccount.account_number,
          routing_number: bankAccount.routing_number,
          can_ach: bankAccount.can_ach,
          can_wire: bankAccount.can_wire,
          bank_address: bankAccount.bank_address,
          recipient_name: bankAccount.recipient_name,
          recipient_address: bankAccount.recipient_address,
          verified_at:
            role === UserRolesEnum.BankAdmin
              ? bankAccount.verified_at
              : undefined,
          verified_date:
            role === UserRolesEnum.BankAdmin
              ? bankAccount.verified_date
              : undefined,
          is_cannabis_compliant:
            role === UserRolesEnum.BankAdmin ||
            role === UserRolesEnum.CompanyAdmin
              ? bankAccount.is_cannabis_compliant
              : undefined,
        },
      },
    });
  };

  const handleCreateBankAccount = async () => {
    await addBankAccount({
      variables: {
        bankAccount: {
          bank_name: bankAccount.bank_name,
          account_title: bankAccount.account_title,
          account_type: bankAccount.account_type,
          account_number: bankAccount.account_number,
          routing_number: bankAccount.routing_number,
          can_ach: bankAccount.can_ach,
          can_wire: bankAccount.can_wire,
          bank_address: bankAccount.bank_address,
          recipient_name: bankAccount.recipient_name,
          recipient_address: bankAccount.recipient_address,
          verified_at:
            role === UserRolesEnum.BankAdmin
              ? bankAccount.verified_at
              : undefined,
          verified_date:
            role === UserRolesEnum.BankAdmin
              ? bankAccount.verified_date
              : undefined,
          company_id: role === UserRolesEnum.BankAdmin ? companyId : undefined,
          is_cannabis_compliant:
            role === UserRolesEnum.BankAdmin ||
            role === UserRolesEnum.CompanyAdmin
              ? bankAccount.is_cannabis_compliant
              : undefined,
        },
      },
    });
  };

  const handleSubmit = async () => {
    let fn = handleCreateBankAccount;
    let successMessage = "Bank account created.";

    if (existingBankAccount) {
      fn = handleUpdateBankAccount;
      successMessage = "Bank account updated.";
    }

    try {
      await fn();
      handleClose();
      snackbar.showSuccess(successMessage);
    } catch (err) {
      snackbar.showError(`Error! Message: ${err}`);
      console.error(err);
    }
  };

  const [
    addBankAccount,
    { loading: isAddBankAccountLoading },
  ] = useAddBankAccountMutation();
  const [
    updateBankAccount,
    { loading: isUpdateBankAccountLoading },
  ] = useUpdateBankAccountMutation();

  const isSubmitDisabled =
    isAddBankAccountLoading ||
    isUpdateBankAccountLoading ||
    !bankAccount.bank_name ||
    !bankAccount.account_title ||
    !bankAccount.account_type ||
    !bankAccount.routing_number ||
    !bankAccount.account_number ||
    (bankAccount.verified_at && !bankAccount.verified_date);

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
          role={role}
          bankAccount={bankAccount}
          setBankAccount={setBankAccount}
        />
        <Box display="flex" flexDirection="row-reverse" my={3}>
          <Button
            size="small"
            variant="contained"
            color="primary"
            disabled={isSubmitDisabled}
            onClick={handleSubmit}
          >
            {existingBankAccount ? "Update" : "Add"}
          </Button>
          <Box mr={1}>
            <Button size="small" onClick={handleClose}>
              Cancel
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
export default CreateUpdateBankAccountModal;
