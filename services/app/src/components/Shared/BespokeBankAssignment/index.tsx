import {
  Box,
  FormControl,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  Theme,
} from "@material-ui/core";
import BankAccountInfoCard from "components/Shared/BankAccount/BankAccountInfoCard";
import { BankAccountFragment, useBankAccountsQuery } from "generated/graphql";

interface Props {
  label: string;
  onAssignment: (bankAccount: BankAccountFragment | null) => void;
  assignedBespokeBankAccount?: BankAccountFragment;
}

const useStyles = makeStyles((theme: Theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 200,
  },
}));

function BespokeBankAssignment(props: Props) {
  const classes = useStyles();
  const { data } = useBankAccountsQuery();
  const labelId = props.label.split(" ").join("-");

  if (!data || !data.bank_accounts) {
    return null;
  }

  return (
    <>
      <Box display="flex" flexDirection="column">
        <FormControl className={classes.formControl}>
          <InputLabel id={`bank-account-assignment-label--${labelId}`}>
            {props.label}
          </InputLabel>
          <Select
            label={props.label}
            id={`bank-account-assignment--${labelId}`}
            labelId={`bank-account-assignment-label--${labelId}`}
            value={props.assignedBespokeBankAccount?.id || "None"}
            onChange={({ target: { value } }) => {
              const bankAccount =
                data.bank_accounts.find((bank) => bank.id === value) || null;
              props.onAssignment(bankAccount);
            }}
          >
            <MenuItem key="none" value="None">
              None
            </MenuItem>
            {data.bank_accounts.map((bank_account) => {
              return (
                <MenuItem key={bank_account.id} value={bank_account.id}>
                  {`${bank_account.bank_name} (${bank_account.account_type})`}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <Box mt={2} width="fit-content">
          {props.assignedBespokeBankAccount && (
            <BankAccountInfoCard
              bankAccount={props.assignedBespokeBankAccount}
            ></BankAccountInfoCard>
          )}
        </Box>
      </Box>
    </>
  );
}

export default BespokeBankAssignment;
