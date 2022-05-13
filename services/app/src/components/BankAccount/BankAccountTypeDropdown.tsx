import { Select, InputLabel, MenuItem } from "@material-ui/core";
import { BankAccountType } from "lib/enum";

interface Props {
  bankAccountType: BankAccountType;
  setBankAccountType: (update: BankAccountType) => void;
}

export default function BankAccountTypeDropdown({
  bankAccountType,
  setBankAccountType,
}: Props) {
  return (
    <>
      <InputLabel id="bank-account-type-label" required>
        Bank Account Type
      </InputLabel>
      <Select
        id="select-bank-account-type"
        labelId="select-bank-account-type-label"
        value={bankAccountType}
        onChange={({ target: { value } }) =>
          setBankAccountType(value as BankAccountType)
        }
      >
        <MenuItem
          key={BankAccountType.Checking}
          value={BankAccountType.Checking}
        >
          {BankAccountType.Checking}
        </MenuItem>
        <MenuItem key={BankAccountType.Savings} value={BankAccountType.Savings}>
          {BankAccountType.Savings}
        </MenuItem>
      </Select>
    </>
  );
}
