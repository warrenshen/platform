import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Theme,
  makeStyles,
} from "@material-ui/core";
import BankAccountInfoCard from "components/BankAccount/BankAccountInfoCard";
import {
  BankAccountFragment,
  Companies,
  useGetBankAccountsByCompanyIdQuery,
} from "generated/graphql";

interface Props {
  companyId: Companies["id"];
  label: string;
  onAssignment: (bankAccount: BankAccountFragment | null) => void;
  assignedBankAccount: BankAccountFragment | null;
}

const useStyles = makeStyles((theme: Theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 300,
  },
}));

export default function CompanyBankAssignment({
  companyId,
  label,
  onAssignment,
  assignedBankAccount,
}: Props) {
  const classes = useStyles();

  const { data, error } = useGetBankAccountsByCompanyIdQuery({
    fetchPolicy: "network-only",
    variables: {
      companyId,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const labelId = label.split(" ").join("-");

  if (!data || !data.bank_accounts) {
    return null;
  }

  return (
    <>
      <Box display="flex" flexDirection="column">
        <FormControl className={classes.formControl}>
          <InputLabel id={`bank-account-assignment-label--${labelId}`}>
            {label}
          </InputLabel>
          <Select
            label={label}
            id={`bank-account-assignment--${labelId}`}
            labelId={`bank-account-assignment-label--${labelId}`}
            data-cy={`bank-account-assignment-label--${labelId}`}
            value={assignedBankAccount?.id || "None"}
            onChange={({ target: { value } }) => {
              const bankAccount =
                data.bank_accounts.find((bank) => bank.id === value) || null;
              onAssignment(bankAccount);
            }}
          >
            <MenuItem key="none" value="None">
              None
            </MenuItem>
            {data.bank_accounts.map((bank_account, index) => {
              return (
                <MenuItem
                  key={bank_account.id}
                  value={bank_account.id}
                  data-cy={`bank-account-assignment-label--${labelId}-item-${index}`}
                >
                  {`${bank_account.bank_name}: ${bank_account.account_title} (${bank_account.account_type})`}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <Box mt={2} width="fit-content">
          {assignedBankAccount && (
            <BankAccountInfoCard bankAccount={assignedBankAccount} />
          )}
        </Box>
      </Box>
    </>
  );
}
