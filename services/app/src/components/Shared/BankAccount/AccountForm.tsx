import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  makeStyles,
  TextField,
} from "@material-ui/core";
import { CurrentUserContext, UserRole } from "contexts/CurrentUserContext";
import {
  BankAccountFragment,
  Companies,
  CompanyBankAccountsDocument,
  CompanyBankAccountsInsertInput,
  CompanyDocument,
  useAddBankAccountMutation,
  useUpdateBankAccountMutation,
} from "generated/graphql";
import { timestamptzNow } from "lib/time";
import { ChangeEvent, useContext, useEffect, useState } from "react";

const useStyles = makeStyles({
  form: {
    width: 300,
  },
  selectInput: {
    height: 30,
  },
});

function AccountForm(props: {
  companyId: Companies["id"];
  onCancel: () => void;
  bankAccount?: BankAccountFragment;
}) {
  const { role: currentUserRole } = useContext(CurrentUserContext);
  const classes = useStyles();
  const [
    addBankAccount,
    { loading: insertLoading },
  ] = useAddBankAccountMutation();
  const [
    updateBankAccount,
    { loading: updateLoading },
  ] = useUpdateBankAccountMutation();
  const [
    bankAccount,
    setBankAccount,
  ] = useState<CompanyBankAccountsInsertInput>(
    props.bankAccount || {
      company_id: props.companyId,
    }
  );

  useEffect(() => {
    setBankAccount(props.bankAccount || {});
  }, [props.bankAccount]);

  return (
    <>
      <Box
        mt={1}
        mb={3}
        display="flex"
        flexDirection="column"
        className={classes.form}
      >
        <TextField
          label="Bank"
          required
          value={bankAccount.name}
          onChange={({ target: { value } }) => {
            setBankAccount({ ...bankAccount, name: value });
          }}
        ></TextField>
        <TextField
          label="Account Name"
          required
          value={bankAccount.account_name}
          onChange={({ target: { value } }) => {
            setBankAccount({ ...bankAccount, account_name: value });
          }}
        ></TextField>
        <TextField
          label="Routing Number"
          required
          value={bankAccount.routing_number}
          onChange={({ target: { value } }) => {
            setBankAccount({ ...bankAccount, routing_number: value });
          }}
        ></TextField>
        <TextField
          label="Account Number"
          required
          value={bankAccount.account_number}
          onChange={({ target: { value } }) => {
            setBankAccount({ ...bankAccount, account_number: value });
          }}
        ></TextField>
        {currentUserRole === UserRole.Bank && (
          <>
            <TextField
              multiline
              rows={3}
              label="Notes"
              value={bankAccount.notes}
              onChange={({ target: { value } }) => {
                setBankAccount({ ...bankAccount, notes: value });
              }}
            ></TextField>
            <FormControlLabel
              control={
                <Checkbox
                  checked={bankAccount.verified_at}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    setBankAccount({
                      ...bankAccount,
                      verified_at: event.target.checked
                        ? timestamptzNow()
                        : null,
                    });
                  }}
                  color="primary"
                />
              }
              label={"Verified bank account transfer"}
            />
          </>
        )}
        <Box display="flex" flexDirection="row-reverse" my={3}>
          <Button
            size="small"
            variant="contained"
            color="primary"
            disabled={
              insertLoading ||
              updateLoading ||
              !bankAccount.name ||
              !bankAccount.account_name ||
              !bankAccount.routing_number ||
              !bankAccount.account_number
            }
            onClick={async () => {
              if (props.bankAccount) {
                await updateBankAccount({
                  variables: {
                    id: bankAccount.id,
                    bankAccount,
                  },
                  optimisticResponse: {
                    update_company_bank_accounts_by_pk: {
                      ...(bankAccount as BankAccountFragment),
                    },
                  },
                });
              } else {
                await addBankAccount({
                  variables: {
                    bankAccount: {
                      ...bankAccount,
                      company_id: props.companyId,
                    },
                  },
                  refetchQueries: [
                    {
                      query: CompanyBankAccountsDocument,
                      variables: {
                        companyId: props.companyId,
                      },
                    },
                    {
                      query: CompanyDocument,
                      variables: {
                        companyId: props.companyId,
                      },
                    },
                  ],
                });
              }
              props.onCancel();
            }}
          >
            {props.bankAccount ? "Update" : "Add"}
          </Button>
          <Box mr={1}>
            <Button size="small" onClick={props.onCancel}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default AccountForm;
