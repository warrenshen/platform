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
      <Box display="flex" flexDirection="column" mt={2}>
        <TextField
          label="Bank Name"
          required
          value={bankAccount.bank_name}
          onChange={({ target: { value } }) =>
            setBankAccount({ ...bankAccount, bank_name: value })
          }
        />
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <TextField
          label="Account Name"
          required
          value={bankAccount.account_title || ""}
          onChange={({ target: { value } }) =>
            setBankAccount({ ...bankAccount, account_title: value })
          }
        />
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
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
      <Box display="flex" flexDirection="column" mt={2}>
        <TextField
          label="Account Number"
          required
          value={bankAccount.account_number}
          onChange={({ target: { value } }) =>
            setBankAccount({ ...bankAccount, account_number: value })
          }
        />
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
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
      {bankAccount.can_ach && (
        <Box ml={4}>
          <Box display="flex" flexDirection="column" mt={2}>
            <TextField
              label="ACH Routing Number"
              required
              value={bankAccount.routing_number}
              onChange={({ target: { value } }) =>
                setBankAccount({ ...bankAccount, routing_number: value })
              }
            />
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <TextField
              label="ACH Memo"
              className={classes.form}
              value={bankAccount.ach_default_memo}
              onChange={({ target: { value } }) =>
                setBankAccount({
                  ...bankAccount,
                  ach_default_memo: value,
                })
              }
            />
          </Box>
          {role === UserRolesEnum.BankAdmin && (
            <Box display="flex" flexDirection="column" mt={2}>
              <TextField
                label="ACH Template Name"
                // The "required" is NOT actually enforced, but the asterik is a helpful prompt for user. Ops team does not want
                // to enforce it because sometimes the template name is determined some time after the bank account is created.
                required
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
          )}
        </Box>
      )}
      <Box display="flex" flexDirection="column" mt={2}>
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
      </Box>
      {bankAccount.can_wire && (
        <Box ml={4}>
          <Box display="flex" flexDirection="column" mt={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!bankAccount.is_wire_intermediary}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setBankAccount({
                      ...bankAccount,
                      is_wire_intermediary: event.target.checked,
                    })
                  }
                  color="primary"
                />
              }
              label={"Is intermediary bank?"}
            />
          </Box>
          {bankAccount.is_wire_intermediary && (
            <Box ml={4}>
              <Box display="flex" flexDirection="column" mt={2}>
                <TextField
                  className={classes.form}
                  required
                  label="Intermediary Bank Name"
                  value={bankAccount.intermediary_bank_name}
                  onChange={({ target: { value } }) =>
                    setBankAccount({
                      ...bankAccount,
                      intermediary_bank_name: value,
                    })
                  }
                />
              </Box>
              <Box display="flex" flexDirection="column" mt={2}>
                <TextField
                  className={classes.form}
                  required
                  label="Intermediary Bank Address"
                  value={bankAccount.intermediary_bank_address}
                  onChange={({ target: { value } }) =>
                    setBankAccount({
                      ...bankAccount,
                      intermediary_bank_address: value,
                    })
                  }
                />
              </Box>
              <Box display="flex" flexDirection="column" mt={2}>
                <TextField
                  className={classes.form}
                  required
                  label="Intermediary Account Name"
                  value={bankAccount.intermediary_account_name}
                  onChange={({ target: { value } }) =>
                    setBankAccount({
                      ...bankAccount,
                      intermediary_account_name: value,
                    })
                  }
                />
              </Box>
              <Box display="flex" flexDirection="column" mt={2}>
                <TextField
                  className={classes.form}
                  required
                  label="Intermediary Account Number"
                  value={bankAccount.intermediary_account_number}
                  onChange={({ target: { value } }) =>
                    setBankAccount({
                      ...bankAccount,
                      intermediary_account_number: value,
                    })
                  }
                />
              </Box>
            </Box>
          )}
          <Box display="flex" flexDirection="column" mt={2}>
            <TextField
              label="Wire Routing Number"
              required
              value={bankAccount.wire_routing_number}
              onChange={({ target: { value } }) =>
                setBankAccount({ ...bankAccount, wire_routing_number: value })
              }
            />
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <TextField
              label="Recipient Address"
              required
              className={classes.form}
              value={bankAccount.recipient_address}
              onChange={({ target: { value } }) =>
                setBankAccount({ ...bankAccount, recipient_address: value })
              }
            />
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <TextField
              label="Recipient Address 2"
              required
              className={classes.form}
              value={bankAccount.recipient_address_2}
              onChange={({ target: { value } }) =>
                setBankAccount({ ...bankAccount, recipient_address_2: value })
              }
            />
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <TextField
              label="Wire Memo"
              className={classes.form}
              value={bankAccount.wire_default_memo}
              onChange={({ target: { value } }) =>
                setBankAccount({
                  ...bankAccount,
                  wire_default_memo: value,
                })
              }
            />
          </Box>
          {role === UserRolesEnum.BankAdmin && (
            <Box display="flex" flexDirection="column" mt={2}>
              <TextField
                label="Wire Template Name"
                // The "required" is NOT actually enforced, but the asterik is a helpful prompt for user. Ops team does not want
                // to enforce it because sometimes the template name is determined some time after the bank account is created.
                required
                className={classes.form}
                value={bankAccount.wire_template_name}
                onChange={({ target: { value } }) =>
                  setBankAccount({
                    ...bankAccount,
                    wire_template_name: value,
                  })
                }
              />
            </Box>
          )}
          {role === UserRolesEnum.BankAdmin && (
            <Box display="flex" flexDirection="column" mt={2}>
              <TextField
                label="Bank Address (Deprecated)"
                className={classes.form}
                value={bankAccount.bank_address}
                onChange={({ target: { value } }) =>
                  setBankAccount({
                    ...bankAccount,
                    bank_address: value,
                  })
                }
              />
            </Box>
          )}
        </Box>
      )}
      {(role === UserRolesEnum.BankAdmin ||
        role === UserRolesEnum.CompanyAdmin) && (
        <Box display="flex" flexDirection="column" mt={2}>
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
            label={"Is cannabis compliant?"}
          />
        </Box>
      )}
      {role === UserRolesEnum.BankAdmin && (
        <Box display="flex" flexDirection="column" mt={2}>
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
            label={"Is bank account transfer verified?"}
          />
        </Box>
      )}
      {role === UserRolesEnum.BankAdmin && !!bankAccount.verified_at && (
        <Box ml={4}>
          <Box display="flex" flexDirection="column" mt={2}>
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
        </Box>
      )}
    </Box>
  );
}
