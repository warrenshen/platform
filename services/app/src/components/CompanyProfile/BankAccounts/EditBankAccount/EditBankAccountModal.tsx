import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  makeStyles,
  TextField,
  Theme,
} from "@material-ui/core";
import {
  CompanyBankAccountFragment,
  CompanyBankAccountsInsertInput,
  CompanyBankAccountsSetInput,
  CompanyDocument,
  useAddCompanyBankAccountMutation,
  useUpdateCompanyBankAccountMutation,
} from "generated/graphql";
import { Maybe } from "graphql/jsutils/Maybe";
import { ActionType } from "lib/ActionType";
import { useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    nameInput: {
      width: 400,
    },
    addressForm: {
      width: 600,
    },
    addressSubForm: {
      width: 140,
    },
  })
);

interface Props {
  bankAccount: Maybe<CompanyBankAccountFragment>;
  actionType: ActionType;

  handleClose: () => void;
}

function EditBankAccountModal({
  bankAccount: bankAccountToEdit,
  actionType,
  handleClose,
}: Props) {
  const classes = useStyles();
  const [companyBankAccount, setCompanyBankAccount] = useState<
    Maybe<CompanyBankAccountFragment>
  >(bankAccountToEdit);
  const [
    updateBankAccount,
    { loading: updateBankAccountLoading },
  ] = useUpdateCompanyBankAccountMutation();

  const [
    addBankAccount,
    { loading: addBankAccountLoading },
  ] = useAddCompanyBankAccountMutation();

  let isFormValid =
    companyBankAccount?.name &&
    companyBankAccount?.account_name &&
    companyBankAccount?.account_number &&
    companyBankAccount?.routing_number &&
    companyBankAccount?.notes;

  return (
    <Dialog open onClose={handleClose} maxWidth="md">
      <DialogTitle>{`${
        actionType === ActionType.Update ? "Edit" : "Add"
      } Bank account`}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please provide details about bank account.
        </DialogContentText>
        <Box pb={3} pt={2}>
          <TextField
            label="Name"
            required
            className={classes.nameInput}
            value={companyBankAccount?.name}
            onChange={({ target: { value } }) => {
              setCompanyBankAccount({
                ...companyBankAccount,
                name: value,
              } as CompanyBankAccountFragment);
            }}
          ></TextField>
        </Box>
        <Box pb={3} pt={2}>
          <TextField
            label="Account name"
            required
            className={classes.nameInput}
            value={companyBankAccount?.account_name}
            onChange={({ target: { value } }) => {
              setCompanyBankAccount({
                ...companyBankAccount,
                account_name: value,
              } as CompanyBankAccountFragment);
            }}
          ></TextField>
        </Box>
        <Box pb={3} pt={2}>
          <TextField
            label="Account number"
            required
            className={classes.nameInput}
            value={companyBankAccount?.account_number}
            onChange={({ target: { value } }) => {
              setCompanyBankAccount({
                ...companyBankAccount,
                account_number: value,
              } as CompanyBankAccountFragment);
            }}
          ></TextField>
        </Box>
        <Box pb={3} pt={2}>
          <TextField
            label="Routing number"
            required
            className={classes.nameInput}
            value={companyBankAccount?.routing_number}
            onChange={({ target: { value } }) => {
              setCompanyBankAccount({
                ...companyBankAccount,
                routing_number: value,
              } as CompanyBankAccountFragment);
            }}
          ></TextField>
        </Box>
        <Box pb={3} pt={2}>
          <TextField
            label="Notes"
            className={classes.nameInput}
            value={companyBankAccount?.notes}
            onChange={({ target: { value } }) => {
              setCompanyBankAccount({
                ...companyBankAccount,
                notes: value,
              } as CompanyBankAccountFragment);
            }}
          ></TextField>
        </Box>
      </DialogContent>
      <DialogActions>
        <Box display="flex">
          <Box pr={1}>
            <Button onClick={handleClose}>Cancel</Button>
          </Box>

          <Button
            disabled={
              updateBankAccountLoading || addBankAccountLoading || !isFormValid
            }
            onClick={async () => {
              if (actionType === ActionType.Update) {
                await updateBankAccount({
                  variables: {
                    id: companyBankAccount?.id,
                    bankAccount: companyBankAccount as CompanyBankAccountsSetInput,
                  },
                  refetchQueries: [
                    {
                      query: CompanyDocument,
                      variables: {
                        companyId: companyBankAccount?.company_id,
                      },
                    },
                  ],
                });
              } else {
                await addBankAccount({
                  variables: {
                    bankAccount: companyBankAccount as CompanyBankAccountsInsertInput,
                  },
                  refetchQueries: [
                    {
                      query: CompanyDocument,
                      variables: {
                        companyId: companyBankAccount?.company_id,
                      },
                    },
                  ],
                });
              }
              handleClose();
            }}
            variant="contained"
            color="primary"
          >
            Submit
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default EditBankAccountModal;
