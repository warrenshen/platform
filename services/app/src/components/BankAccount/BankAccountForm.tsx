import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  makeStyles,
  TextField,
} from "@material-ui/core";
import DatePicker from "components/Shared/Dates/DatePicker";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  BankAccountFragment,
  BankAccountsDocument,
  BankAccountsInsertInput,
  Companies,
  CompanyBankAccountsDocument,
  CompanyForCustomerDocument,
  useAddBankAccountMutation,
  UserRolesEnum,
  useUpdateBankAccountMutation,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import { isNull, mergeWith } from "lodash";
import { ChangeEvent, useContext, useMemo, useState } from "react";

const useStyles = makeStyles({
  form: {
    width: "100%",
  },
});

interface Props {
  companyId: Companies["id"] | null;
  existingBankAccount: BankAccountFragment | null;
  onCancel: () => void;
}

function BankAccountForm({ companyId, existingBankAccount, onCancel }: Props) {
  const snackbar = useSnackbar();
  const classes = useStyles();
  const {
    user: { role },
  } = useContext(CurrentUserContext);

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
      />
      <TextField
        label="Account Title"
        placeholder="Title on the account"
        required
        value={bankAccount.account_title || ""}
        onChange={({ target: { value } }) => {
          setBankAccount({ ...bankAccount, account_title: value });
        }}
      />
      <TextField
        label="Account Type"
        placeholder="Checking, Savings, etc"
        required
        value={bankAccount.account_type}
        onChange={({ target: { value } }) => {
          setBankAccount({ ...bankAccount, account_type: value });
        }}
      />
      <TextField
        label="Routing Number"
        required
        value={bankAccount.routing_number}
        onChange={({ target: { value } }) => {
          setBankAccount({ ...bankAccount, routing_number: value });
        }}
      />
      <TextField
        label="Account Number"
        required
        value={bankAccount.account_number}
        onChange={({ target: { value } }) => {
          setBankAccount({ ...bankAccount, account_number: value });
        }}
      />
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
          />
          <TextField
            label="Recipient Name"
            className={classes.form}
            value={bankAccount.recipient_name}
            onChange={({ target: { value } }) => {
              setBankAccount({ ...bankAccount, recipient_name: value });
            }}
          />
          <TextField
            label="Recipient Address"
            className={classes.form}
            value={bankAccount.recipient_address}
            onChange={({ target: { value } }) => {
              setBankAccount({ ...bankAccount, recipient_address: value });
            }}
          />
        </Box>
      )}
      {role === UserRolesEnum.BankAdmin && (
        <Box mt={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!bankAccount.verified_at}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  setBankAccount({
                    ...bankAccount,
                    verified_at: !bankAccount.verified_at ? "now()" : null,
                    verified_date: null,
                  });
                }}
                color="primary"
              />
            }
            label={"Verified bank account transfer"}
          />
        </Box>
      )}
      {role === UserRolesEnum.BankAdmin && !!bankAccount.verified_at && (
        <Box mt={2}>
          <DatePicker
            id="date-picker-verified-date"
            label="Verified Date"
            value={bankAccount.verified_date}
            onChange={(value) => {
              setBankAccount({
                ...bankAccount,
                verified_date: value,
              });
            }}
          />
        </Box>
      )}
      <Box display="flex" flexDirection="row-reverse" my={3}>
        <Button
          size="small"
          variant="contained"
          color="primary"
          disabled={isSubmitDisabled}
          onClick={async () => {
            if (existingBankAccount) {
              try {
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
                    },
                  },
                });
                onCancel();
                snackbar.showSuccess("Success! Bank account updated.");
              } catch (err) {
                snackbar.showError(`Error! Message: ${err}.`);
              }
            } else {
              try {
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
                      company_id:
                        role === UserRolesEnum.BankAdmin
                          ? companyId
                          : undefined,
                    },
                  },
                  refetchQueries: companyId
                    ? [
                        {
                          query: CompanyBankAccountsDocument,
                          variables: {
                            companyId,
                          },
                        },
                        {
                          query: CompanyForCustomerDocument,
                          variables: {
                            companyId,
                          },
                        },
                      ]
                    : [
                        {
                          query: BankAccountsDocument,
                        },
                      ],
                });
                onCancel();
                snackbar.showSuccess("Success! Bank account created.");
              } catch (err) {
                snackbar.showError("Error! Something went wrong.");
                console.log(err);
              }
            }
          }}
        >
          {existingBankAccount ? "Update" : "Add"}
        </Button>
        <Box mr={1}>
          <Button size="small" onClick={onCancel}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default BankAccountForm;
