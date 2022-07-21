import { Box, TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { Users } from "generated/graphql";

interface Props {
  onChange: (event: any, newValue: any) => void;
  textFieldLabel: string;
  selectedUserId: Users["id"];
  users: Pick<Users, "id" | "full_name">[] | undefined;
}

const AutocompleteUsers = ({
  onChange,
  textFieldLabel,
  selectedUserId,
  users,
}: Props) => {
  const selectedUser = users?.find(({ id }) => id === selectedUserId) || null;

  return users ? (
    <Box mt={4}>
      <Autocomplete
        autoHighlight
        id="auto-complete-debt-facility"
        options={users}
        value={selectedUser}
        getOptionLabel={({ full_name }) => full_name}
        renderInput={(params) => (
          <TextField {...params} label={textFieldLabel} variant="outlined" />
        )}
        onChange={onChange}
      />
    </Box>
  ) : null;
};

export default AutocompleteUsers;
