import {
  Box,
  Button,
  debounce,
  makeStyles,
  MenuItem,
  Select,
  TextField,
} from "@material-ui/core";
import { CheckBox } from "@material-ui/icons";
import {
  BankAccountFragment,
  Companies,
  CompanyBankAccountsDocument,
  CompanyBankAccountsInsertInput,
  CompanyVendorPartnerships,
  useAddBankAccountMutation,
  useChangeBankAccountMutation,
  useCompanyBankAccountsQuery,
  useUpdateBankAccountMutation,
} from "generated/graphql";
import { useEffect, useRef, useState } from "react";

const useStyles = makeStyles({
  baseInput: {
    width: 300,
  },
});

function NewBankAccountForm(props: {
  companyId: Companies["id"];
  onCancel: () => void;
}) {
  const classes = useStyles();
  const [addBankAccount, { loading }] = useAddBankAccountMutation();
  const [
    bankAccount,
    setBankAccount,
  ] = useState<CompanyBankAccountsInsertInput>({
    company_id: props.companyId,
  });

  return (
    <>
      <Box mt={1} mb={3} display="flex" flexDirection="column">
        <TextField
          label="Bank"
          required
          className={classes.baseInput}
          onChange={({ target: { value } }) => {
            setBankAccount({ ...bankAccount, name: value });
          }}
        ></TextField>
        <TextField
          label="Account Name"
          required
          className={classes.baseInput}
          onChange={({ target: { value } }) => {
            setBankAccount({ ...bankAccount, account_name: value });
          }}
        ></TextField>
        <TextField
          label="Routing Number"
          required
          className={classes.baseInput}
          onChange={({ target: { value } }) => {
            setBankAccount({ ...bankAccount, routing_number: value });
          }}
        ></TextField>
        <TextField
          label="Account Number"
          required
          className={classes.baseInput}
          onChange={({ target: { value } }) => {
            setBankAccount({ ...bankAccount, account_number: value });
          }}
        ></TextField>
        <TextField
          multiline
          rows={3}
          label="Notes"
          className={classes.baseInput}
          onChange={({ target: { value } }) => {
            setBankAccount({ ...bankAccount, notes: value });
          }}
        ></TextField>
      </Box>
      <Box display="flex">
        <Button onClick={props.onCancel}>Cancel</Button>
        <Button
          disabled={
            loading ||
            !bankAccount.name ||
            !bankAccount.account_name ||
            !bankAccount.routing_number ||
            !bankAccount.account_number
          }
          onClick={async () => {
            await addBankAccount({
              variables: {
                bankAccount,
              },
              refetchQueries: [
                {
                  query: CompanyBankAccountsDocument,
                  variables: {
                    companyId: props.companyId,
                  },
                },
              ],
            });
            props.onCancel();
          }}
        >
          Add
        </Button>
      </Box>
    </>
  );
}

function BankAccountInput(props: {
  companyId: Companies["id"];
  companyVendorPartnershipId: CompanyVendorPartnerships["id"];
  bankAccount?: BankAccountFragment | null;
}) {
  const classes = useStyles();
  const [updateBankAccount] = useUpdateBankAccountMutation();
  const [changeBankAccount] = useChangeBankAccountMutation();
  const { data } = useCompanyBankAccountsQuery({
    variables: {
      companyId: props.companyId,
    },
  });

  const [addingNewAccount, setAddingNewAccount] = useState(false);

  const [
    selectedBankAccount,
    setSelectedBankAccount,
  ] = useState<BankAccountFragment | null>(props.bankAccount || null);

  useEffect(() => {
    setSelectedBankAccount(props.bankAccount || null);
  }, [props.bankAccount]);

  const debouncedUpdateBankAccount = useRef(
    debounce((value: BankAccountFragment | null) => {
      if (value?.id) {
        updateBankAccount({
          variables: {
            id: value.id,
            bankAccount: value,
          },
        });
      }
    }, 300)
  ).current;

  useEffect(() => {
    debouncedUpdateBankAccount(selectedBankAccount);
  }, [debouncedUpdateBankAccount, selectedBankAccount]);

  return (
    <>
      <Box>
        <Box>
          <Button
            disabled={addingNewAccount}
            variant="outlined"
            onClick={() => {
              setAddingNewAccount(true);
            }}
          >
            New
          </Button>
          {data?.company_bank_accounts.length ? (
            <Select
              variant="outlined"
              value={props.bankAccount?.id || null}
              onChange={({ target: { value } }) => {
                changeBankAccount({
                  variables: {
                    bankAccountId: value,
                    companyVendorPartnershipId:
                      props.companyVendorPartnershipId,
                  },
                  optimisticResponse: {
                    update_company_vendor_partnerships_by_pk: {
                      id: props.companyVendorPartnershipId,
                      vendor_bank_account: data.company_bank_accounts.find(
                        (bank) => bank.id === value
                      ),
                    },
                  },
                });
              }}
            >
              {data.company_bank_accounts.map((bank_account) => {
                return (
                  <MenuItem value={bank_account.id}>
                    {bank_account.name} + {bank_account.account_name}
                  </MenuItem>
                );
              })}
            </Select>
          ) : null}
        </Box>
      </Box>
      {addingNewAccount && (
        <NewBankAccountForm
          companyId={props.companyId}
          onCancel={() => setAddingNewAccount(false)}
        ></NewBankAccountForm>
      )}
      {selectedBankAccount && !addingNewAccount && (
        <Box mt={1} mb={3} display="flex" flexDirection="column">
          <TextField
            label="Bank"
            value={selectedBankAccount.name}
            className={classes.baseInput}
            onChange={({ target: { value } }) => {
              setSelectedBankAccount({ ...selectedBankAccount, name: value });
            }}
          ></TextField>
          <TextField
            label="Account Name"
            value={selectedBankAccount.account_name}
            className={classes.baseInput}
            onChange={({ target: { value } }) => {
              setSelectedBankAccount({
                ...selectedBankAccount,
                account_name: value,
              });
            }}
          ></TextField>
          <TextField
            label="Routing Number"
            value={selectedBankAccount.routing_number}
            className={classes.baseInput}
            onChange={({ target: { value } }) => {
              setSelectedBankAccount({
                ...selectedBankAccount,
                routing_number: value,
              });
            }}
          ></TextField>
          <TextField
            label="Account Number"
            className={classes.baseInput}
            value={selectedBankAccount.account_number}
            onChange={({ target: { value } }) => {
              setSelectedBankAccount({
                ...selectedBankAccount,
                account_number: value,
              });
            }}
          ></TextField>
          <TextField
            multiline
            rows={3}
            label="Notes"
            value={selectedBankAccount.notes}
            className={classes.baseInput}
            onChange={({ target: { value } }) => {
              setSelectedBankAccount({
                ...selectedBankAccount,
                notes: value,
              });
            }}
          ></TextField>
          <CheckBox></CheckBox>
        </Box>
      )}
    </>
  );
}

export default BankAccountInput;
