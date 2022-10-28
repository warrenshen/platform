import { Box, FormControl, MenuItem } from "@material-ui/core";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import { BankLoansMaturingInTimeWindowList } from "lib/enum";

interface Props {
  dataCy?: string;
  id?: string;
  value: string | null;
  setValue: (value: string) => void;
}

export default function LoansMaturingInDropdown({
  dataCy,
  id,
  value,
  setValue,
}: Props) {
  return (
    <Box width={364}>
      <FormControl fullWidth>
        <InputLabel id="loans-maturing-in-dropdown-label">
          Loans maturing in / Past due
        </InputLabel>
        <Select
          data-cy={dataCy}
          id={id || "loans-maturing-in-dropdown"}
          labelId="loans-maturing-in-dropdown-label"
          value={value}
          onChange={({ target: { value } }) => setValue(value as string)}
        >
          {BankLoansMaturingInTimeWindowList.map((key: string) => {
            return (
              <MenuItem data-cy={`${dataCy}-item`} value={key}>
                {key}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </Box>
  );
}
