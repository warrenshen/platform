import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  makeStyles,
  TextField,
} from "@material-ui/core";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  BankAccountFragment,
  BankAccountsDocument,
  BankAccountsInsertInput,
  Companies,
  CompanyBankAccountsDocument,
  CompanyDocument,
  useAddBankAccountMutation,
  UserRolesEnum,
  useUpdateBankAccountMutation,
} from "generated/graphql";
import { timestamptzNow } from "lib/time";
import { ChangeEvent, useContext, useEffect, useState } from "react";

const useStyles = makeStyles({
  form: {
    width: "100%",
    maxWidth: 300,
  },
  selectInput: {
    height: 30,
  },
});

function AccountForm(props: {
  onCancel: () => void;
  companyId?: Companies["id"];
  bankAccount?: BankAccountFragment;
}) {
  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const classes = useStyles();
  const [
    addBankAccount,
    { loading: insertLoading },
  ] = useAddBankAccountMutation();
  const [
    updateBankAccount,
    { loading: updateLoading },
  ] = useUpdateBankAccountMutation();
  const [bankAccount, setBankAccount] = useState<BankAccountsInsertInput>(
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
          label="Bank Name"
          required
          value={bankAccount.bank_name}
          onChange={({ target: { value } }) => {
            setBankAccount({ ...bankAccount, bank_name: value });
          }}
        ></TextField>
        <TextField
          label="Account Type"
          placeholder="Checking, Savings, etc."
          required
          value={bankAccount.account_type}
          onChange={({ target: { value } }) => {
            setBankAccount({ ...bankAccount, account_type: value });
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
        <Box mt={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!bankAccount.can_ach}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  setBankAccount({
                    ...bankAccount,
                    can_ach: event.target.checked,
                  });
                }}
                color="primary"
              />
            }
            label={"ACH"}
          />
        </Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={!!bankAccount.can_wire}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setBankAccount({
                  ...bankAccount,
                  can_wire: event.target.checked,
                });
              }}
              color="primary"
            />
          }
          label={"Wire"}
        />
        {bankAccount.can_wire && (
          <Box ml={4}>
            <TextField
              className={classes.form}
              label="Bank Address"
              value={bankAccount.bank_address}
              onChange={({ target: { value } }) => {
                setBankAccount({ ...bankAccount, bank_address: value });
              }}
            ></TextField>
            <TextField
              label="Recipient Name"
              className={classes.form}
              value={bankAccount.recipient_name}
              onChange={({ target: { value } }) => {
                setBankAccount({ ...bankAccount, recipient_name: value });
              }}
            ></TextField>
            <TextField
              label="Recipient Address"
              className={classes.form}
              value={bankAccount.recipient_address}
              onChange={({ target: { value } }) => {
                setBankAccount({ ...bankAccount, recipient_address: value });
              }}
            ></TextField>
          </Box>
        )}
        {role === UserRolesEnum.BankAdmin && (
          <Box mt={2}>
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
          </Box>
        )}
        <Box display="flex" flexDirection="row-reverse" my={3}>
          <Button
            size="small"
            variant="contained"
            color="primary"
            disabled={
              insertLoading ||
              updateLoading ||
              !bankAccount.bank_name ||
              !bankAccount.account_type ||
              !bankAccount.routing_number ||
              !bankAccount.account_number
            }
            onClick={async () => {
              if (props.bankAccount) {
                await updateBankAccount({
                  variables: {
                    id: bankAccount.id,
                    bankAccount: {
                      bank_name: bankAccount.bank_name,
                      account_type: bankAccount.account_type,
                      account_number: bankAccount.account_number,
                      routing_number: bankAccount.routing_number,
                      can_ach: bankAccount.can_ach,
                      can_wire: bankAccount.can_wire,
                      bank_address: bankAccount.bank_address,
                      recipient_name: bankAccount.recipient_name,
                      recipient_address: bankAccount.recipient_address,
                      verified_at:
                        role === UserRolesEnum.CompanyAdmin
                          ? undefined
                          : bankAccount.verified_at,
                    },
                  },
                  optimisticResponse: {
                    update_bank_accounts_by_pk: {
                      ...(bankAccount as BankAccountFragment),
                    },
                  },
                });
              } else {
                await addBankAccount({
                  variables: {
                    bankAccount: {
                      bank_name: bankAccount.bank_name,
                      account_type: bankAccount.account_type,
                      account_number: bankAccount.account_number,
                      routing_number: bankAccount.routing_number,
                      can_ach: bankAccount.can_ach,
                      can_wire: bankAccount.can_wire,
                      bank_address: bankAccount.bank_address,
                      recipient_name: bankAccount.recipient_name,
                      recipient_address: bankAccount.recipient_address,
                      verified_at:
                        role === UserRolesEnum.CompanyAdmin
                          ? undefined
                          : bankAccount.verified_at,
                      company_id:
                        role === UserRolesEnum.BankAdmin
                          ? props.companyId
                          : undefined,
                    },
                  },
                  refetchQueries: props.companyId
                    ? [
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
                      ]
                    : [
                        {
                          query: BankAccountsDocument,
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
