import {
  Box,
  Checkbox,
  FormControlLabel,
  TextField,
  makeStyles,
} from "@material-ui/core";
import BankAccountTypeDropdown from "components/BankAccount/BankAccountTypeDropdown";
import DateInput from "components/Shared/FormInputs/DateInput";
import { BankAccountsInsertInput, UserRolesEnum } from "generated/graphql";
import { BankAccountType } from "lib/enum";
import { ChangeEvent, useState } from "react";

const useStyles = makeStyles({
  form: {
    width: "100%",
  },
});

interface Props {
  role: UserRolesEnum;
  bankAccount: BankAccountsInsertInput;
  setBankAccount: (update: BankAccountsInsertInput) => void;
  isFormDisabled?: boolean;
}

export default function BankAccountForm({
  bankAccount,
  setBankAccount,
  role,
  isFormDisabled = false,
}: Props) {
  const classes = useStyles();

  const [isVerified, setIsVerified] = useState(!!bankAccount.verified_date);

  return (
    <Box mb={3} display="flex" flexDirection="column" className={classes.form}>
      <Box display="flex" flexDirection="column" mt={2}>
        <TextField
          data-cy="bank-account-form-bank-name"
          label="Bank Name"
          required
          value={bankAccount.bank_name}
          onChange={({ target: { value } }) =>
            setBankAccount({ ...bankAccount, bank_name: value })
          }
          disabled={isFormDisabled}
        />
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <TextField
          data-cy="bank-account-form-bank-account-name"
          label="Account Name"
          required
          value={bankAccount.account_title || ""}
          onChange={({ target: { value } }) =>
            setBankAccount({ ...bankAccount, account_title: value })
          }
          disabled={isFormDisabled}
        />
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <BankAccountTypeDropdown
          bankAccountType={bankAccount.account_type as BankAccountType}
          setBankAccountType={(value) =>
            setBankAccount({ ...bankAccount, account_type: value })
          }
        />
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <TextField
          data-cy="bank-account-form-account-number"
          label="Account Number"
          required
          value={bankAccount.account_number}
          onChange={({ target: { value } }) =>
            setBankAccount({ ...bankAccount, account_number: value })
          }
          disabled={isFormDisabled}
        />
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <FormControlLabel
          control={
            <Checkbox
              data-cy="bank-account-form-ach-checkbox-container"
              checked={!!bankAccount.can_ach}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setBankAccount({
                  ...bankAccount,
                  can_ach: event.target.checked,
                  routing_number: null,
                  ach_default_memo: null,
                })
              }
              color="primary"
              disabled={isFormDisabled}
            />
          }
          label={"ACH"}
        />
      </Box>
      {bankAccount.can_ach && (
        <Box ml={4}>
          <Box display="flex" flexDirection="column" mt={2}>
            <TextField
              data-cy="bank-account-form-ach-routing-number"
              label="ACH Routing Number"
              required
              value={bankAccount.routing_number}
              onChange={({ target: { value } }) =>
                setBankAccount({ ...bankAccount, routing_number: value })
              }
              disabled={isFormDisabled}
            />
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <TextField
              data-cy="bank-account-form-ach-default-memo"
              label="ACH Default Memo"
              className={classes.form}
              value={bankAccount.ach_default_memo}
              onChange={({ target: { value } }) =>
                setBankAccount({
                  ...bankAccount,
                  ach_default_memo: value,
                })
              }
              disabled={isFormDisabled}
            />
          </Box>
        </Box>
      )}
      <Box display="flex" flexDirection="column" mt={2}>
        <FormControlLabel
          control={
            <Checkbox
              data-cy="bank-account-form-wire-checkbox-container"
              checked={!!bankAccount.can_wire}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setBankAccount({
                  ...bankAccount,
                  can_wire: event.target.checked,
                  is_wire_intermediary: null,
                  intermediary_bank_name: null,
                  intermediary_bank_address: null,
                  intermediary_account_name: null,
                  intermediary_account_number: null,
                  wire_routing_number: null,
                  recipient_address: null,
                  recipient_address_2: null,
                  wire_default_memo: null,
                  bank_address: null,
                })
              }
              color="primary"
              disabled={isFormDisabled}
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
                  data-cy="bank-account-form-intermediary-wire-checkbox-container"
                  checked={!!bankAccount.is_wire_intermediary}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setBankAccount({
                      ...bankAccount,
                      is_wire_intermediary: event.target.checked,
                      intermediary_bank_name: null,
                      intermediary_bank_address: null,
                      intermediary_account_name: null,
                      intermediary_account_number: null,
                    })
                  }
                  color="primary"
                  disabled={isFormDisabled}
                />
              }
              label={"Is intermediary bank?"}
            />
          </Box>
          {bankAccount.is_wire_intermediary && (
            <Box ml={4}>
              <Box display="flex" flexDirection="column" mt={2}>
                <TextField
                  data-cy="bank-account-form-intermediary-bank-name"
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
                  disabled={isFormDisabled}
                />
              </Box>
              <Box display="flex" flexDirection="column" mt={2}>
                <TextField
                  data-cy="bank-account-form-intermediary-bank-address"
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
                  disabled={isFormDisabled}
                />
              </Box>
              <Box display="flex" flexDirection="column" mt={2}>
                <TextField
                  data-cy="bank-account-form-intermediary-bank-account-name"
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
                  disabled={isFormDisabled}
                />
              </Box>
              <Box display="flex" flexDirection="column" mt={2}>
                <TextField
                  data-cy="bank-account-form-intermediary-bank-account-number"
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
                  disabled={isFormDisabled}
                />
              </Box>
            </Box>
          )}
          <Box display="flex" flexDirection="column" mt={2}>
            <TextField
              data-cy="bank-account-form-wire-routing-number"
              label="Wire Routing Number"
              required
              value={bankAccount.wire_routing_number}
              onChange={({ target: { value } }) =>
                setBankAccount({ ...bankAccount, wire_routing_number: value })
              }
              disabled={isFormDisabled}
            />
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <TextField
              data-cy="bank-account-form-recipient-address"
              label="Recipient Address"
              required
              className={classes.form}
              value={bankAccount.recipient_address}
              onChange={({ target: { value } }) =>
                setBankAccount({ ...bankAccount, recipient_address: value })
              }
              disabled={isFormDisabled}
            />
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <TextField
              data-cy="bank-account-form-recipient-address2"
              label="Recipient Address 2"
              required
              className={classes.form}
              value={bankAccount.recipient_address_2}
              onChange={({ target: { value } }) =>
                setBankAccount({ ...bankAccount, recipient_address_2: value })
              }
              disabled={isFormDisabled}
            />
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <TextField
              data-cy="bank-account-form-wire-default-memo"
              label="Wire Default Memo"
              className={classes.form}
              value={bankAccount.wire_default_memo}
              onChange={({ target: { value } }) =>
                setBankAccount({
                  ...bankAccount,
                  wire_default_memo: value,
                })
              }
              disabled={isFormDisabled}
            />
          </Box>
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
                disabled={isFormDisabled}
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
                data-cy="bank-account-form-is-company-compliant"
                checked={!!bankAccount.is_cannabis_compliant}
                onChange={(_: ChangeEvent<HTMLInputElement>) => {
                  setBankAccount({
                    ...bankAccount,
                    is_cannabis_compliant: !bankAccount.is_cannabis_compliant,
                  });
                }}
                color="primary"
                disabled={isFormDisabled}
              />
            }
            label={"Is cannabis compliant?"}
          />
        </Box>
      )}
      {(role === UserRolesEnum.BankAdmin ||
        role === UserRolesEnum.CompanyAdmin) && (
        <Box display="flex" flexDirection="column" mt={2}>
          <FormControlLabel
            control={
              <Checkbox
                data-cy="bank-account-form-is-bank-international"
                checked={!!bankAccount.is_bank_international}
                onChange={(_: ChangeEvent<HTMLInputElement>) => {
                  setBankAccount({
                    ...bankAccount,
                    is_bank_international: !bankAccount.is_bank_international,
                  });
                }}
                color="primary"
                disabled={isFormDisabled}
              />
            }
            label={"Is bank international?"}
          />
        </Box>
      )}
      {role === UserRolesEnum.BankAdmin && (
        <Box display="flex" flexDirection="column" mt={2}>
          <FormControlLabel
            control={
              <Checkbox
                data-cy="bank-account-form-is-verified"
                checked={isVerified}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  setBankAccount({
                    ...bankAccount,
                    verified_at: !isVerified ? "now()" : null,
                    verified_date: null,
                  });
                  setIsVerified(!isVerified);
                }}
                color="primary"
                disabled={isFormDisabled}
              />
            }
            label={"Is bank account transfer verified?"}
          />
        </Box>
      )}
      {role === UserRolesEnum.BankAdmin && isVerified && (
        <Box ml={4}>
          <Box display="flex" flexDirection="column" mt={2}>
            <DateInput
              dataCy={"bank-account-form-verified-date-picker"}
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
