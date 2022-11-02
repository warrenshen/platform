import { Box, FormControl, MenuItem, TextField } from "@material-ui/core";
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
        <TextField
          value={value}
          onChange={({ target: { value } }) => setValue(value as string)}
          select
          variant="outlined"
          label="Maturing in / Past due"
        >
          {BankLoansMaturingInTimeWindowList.map((key: string) => {
            return (
              <MenuItem data-cy={`${dataCy}-item`} value={key}>
                {key}
              </MenuItem>
            );
          })}
        </TextField>
      </FormControl>
    </Box>
  );
}
