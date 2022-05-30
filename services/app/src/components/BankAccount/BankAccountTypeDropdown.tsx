import { InputLabel, MenuItem, Select } from "@material-ui/core";
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
        {Object.keys(BankAccountType).map((key) => (
          <MenuItem key={key} value={key}>
            {key}
          </MenuItem>
        ))}
      </Select>
    </>
  );
}
