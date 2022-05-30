import { Box, Typography } from "@material-ui/core";
import Modal from "components/Shared/Modal/Modal";
import { BankAccountFragment } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { deleteBankAccountMutation } from "lib/api/bankAccounts";
import { formatDateString } from "lib/date";

interface Props {
  bankAccount: BankAccountFragment;
  handleClose: () => void;
}

export default function DeleteBankAccountModal({
  bankAccount,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  const [deleteBankAccount, { loading: isDeleteBankAccountMutationLoading }] =
    useCustomMutation(deleteBankAccountMutation);

  const handleSubmit = async () => {
    const response = await deleteBankAccount({
      variables: {
        bank_account_id: bankAccount.id,
      },
    });

    if (response.status === "ERROR") {
      snackbar.showError(response.msg);
    } else {
      snackbar.showSuccess("Bank account deleted.");
      handleClose();
    }
  };

  return (
    <Modal
      isPrimaryActionDisabled={isDeleteBankAccountMutationLoading}
      title={"Delete Bank Account"}
      primaryActionText={"Confirm"}
      handleClose={handleClose}
      handlePrimaryAction={handleSubmit}
    >
      <>
        <Box mb={2}>
          <Typography variant={"h6"}>
            Are you sure you want to delete the following bank account? You
            CANNOT undo this action.
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Bank Name
          </Typography>
          <Typography variant={"body1"}>{bankAccount.bank_name}</Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Account Name
          </Typography>
          <Typography variant={"body1"}>{bankAccount.account_title}</Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Account Type
          </Typography>
          <Typography variant={"body1"}>{bankAccount.account_type}</Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Account Number
          </Typography>
          <Typography variant={"body1"}>
            {bankAccount.account_number}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Can ACH?
          </Typography>
          <Typography variant={"body1"}>
            {bankAccount.can_ach ? "Yes" : "No"}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Can Wire?
          </Typography>
          <Typography variant={"body1"}>
            {bankAccount.can_wire ? "Yes" : "No"}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Is cannabis compliant?
          </Typography>
          <Typography variant={"body1"}>
            {bankAccount.is_cannabis_compliant ? "Yes" : "No"}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Verified Date
          </Typography>
          <Typography variant={"body1"}>
            {formatDateString(bankAccount.verified_date)}
          </Typography>
        </Box>
      </>
    </Modal>
  );
}
