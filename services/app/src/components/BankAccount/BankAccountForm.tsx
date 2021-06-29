import {
  Box,
  Checkbox,
  FormControlLabel,
  makeStyles,
  TextField,
} from "@material-ui/core";
import DateInput from "components/Shared/FormInputs/DateInput";
import { BankAccountsInsertInput, UserRolesEnum } from "generated/graphql";
import { ChangeEvent } from "react";

const useStyles = makeStyles({
  form: {
    width: "100%",
  },
});

interface Props {
  role: UserRolesEnum;
  bankAccount: BankAccountsInsertInput;
  setBankAccount: (update: BankAccountsInsertInput) => void;
}

export default function BankAccountForm({
  bankAccount,
  setBankAccount,
  role,
}: Props) {
  const classes = useStyles();

  return (
    <Box mb={3} display="flex" flexDirection="column" className={classes.form}>
      <Box mt={2}>
        <TextField
          label="Bank Name"
          required
          value={bankAccount.bank_name}
          onChange={({ target: { value } }) =>
            setBankAccount({ ...bankAccount, bank_name: value })
          }
        />
      </Box>
      <Box mt={2}>
        <TextField
          label="Account Title"
          placeholder="Title on the account"
          required
          value={bankAccount.account_title || ""}
          onChange={({ target: { value } }) =>
            setBankAccount({ ...bankAccount, account_title: value })
          }
        />
      </Box>
      <Box mt={2}>
        <TextField
          label="Account Type"
          placeholder="Checking, Savings, etc"
          required
          value={bankAccount.account_type}
          onChange={({ target: { value } }) =>
            setBankAccount({ ...bankAccount, account_type: value })
          }
        />
      </Box>
      <Box mt={2}>
        <TextField
          label="Routing Number"
          required
          value={bankAccount.routing_number}
          onChange={({ target: { value } }) =>
            setBankAccount({ ...bankAccount, routing_number: value })
          }
        />
      </Box>
      <Box mt={2}>
        <TextField
          label="Account Number"
          required
          value={bankAccount.account_number}
          onChange={({ target: { value } }) =>
            setBankAccount({ ...bankAccount, account_number: value })
          }
        />
      </Box>
      <Box mt={2}>
        <FormControlLabel
          control={
            <Checkbox
              checked={!!bankAccount.can_ach}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setBankAccount({
                  ...bankAccount,
                  can_ach: event.target.checked,
                })
              }
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
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setBankAccount({
                ...bankAccount,
                can_wire: event.target.checked,
              })
            }
            color="primary"
          />
        }
        label={"Wire"}
      />
      {bankAccount.can_wire && (
        <Box ml={4}>
          <Box mt={2}>
            <TextField
              className={classes.form}
              label="Bank Address"
              value={bankAccount.bank_address}
              onChange={({ target: { value } }) =>
                setBankAccount({ ...bankAccount, bank_address: value })
              }
            />
          </Box>
          <Box mt={2}>
            <TextField
              label="Recipient Name"
              className={classes.form}
              value={bankAccount.recipient_name}
              onChange={({ target: { value } }) =>
                setBankAccount({ ...bankAccount, recipient_name: value })
              }
            />
          </Box>
          <Box mt={2}>
            <TextField
              label="Recipient Address"
              className={classes.form}
              value={bankAccount.recipient_address}
              onChange={({ target: { value } }) =>
                setBankAccount({ ...bankAccount, recipient_address: value })
              }
            />
          </Box>
          <Box mt={2}>
            <TextField
              label="Recipient Address 2"
              className={classes.form}
              value={bankAccount.recipient_address_2}
              onChange={({ target: { value } }) =>
                setBankAccount({ ...bankAccount, recipient_address_2: value })
              }
            />
          </Box>
        </Box>
      )}
      {role === UserRolesEnum.BankAdmin && (
        <>
          <Box mt={2}>
            <TextField
              label="Torrey Pines Template Name"
              className={classes.form}
              value={bankAccount.torrey_pines_template_name}
              onChange={({ target: { value } }) =>
                setBankAccount({
                  ...bankAccount,
                  torrey_pines_template_name: value,
                })
              }
            />
          </Box>
          <Box mt={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!bankAccount.verified_at}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setBankAccount({
                      ...bankAccount,
                      verified_at: !bankAccount.verified_at ? "now()" : null,
                      verified_date: null,
                    })
                  }
                  color="primary"
                />
              }
              label={"Verified bank account transfer"}
            />
          </Box>
        </>
      )}
      {role === UserRolesEnum.BankAdmin && !!bankAccount.verified_at && (
        <Box mt={2}>
          <DateInput
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
      {(role === UserRolesEnum.BankAdmin ||
        role === UserRolesEnum.CompanyAdmin) && (
        <Box mt={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!bankAccount.is_cannabis_compliant}
                onChange={(_: ChangeEvent<HTMLInputElement>) => {
                  setBankAccount({
                    ...bankAccount,
                    is_cannabis_compliant: !bankAccount.is_cannabis_compliant,
                  });
                }}
                color="primary"
              />
            }
            label={"Cannabis Compliant"}
          />
        </Box>
      )}
    </Box>
  );
}
