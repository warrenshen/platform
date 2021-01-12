import {
  Box,
  FormControl,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  Theme,
} from "@material-ui/core";
import AccountInfoCard from "components/Shared/BankAccount/AccountInfoCard";
import {
  BankAccountFragment,
  Companies,
  useAssignBespokeBankAccountMutation,
  useBankAccountsQuery,
} from "generated/graphql";

interface Props {
  companyId: Companies["id"];
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
  const [assignBankAccount] = useAssignBespokeBankAccountMutation();
  const { data } = useBankAccountsQuery();

  if (!data || !data.bank_accounts) {
    return null;
  }

  return (
    <>
      <FormControl className={classes.formControl}>
        <InputLabel id="bank-account-assignment-label">
          Bespoke Bank Assignment
        </InputLabel>
        <Select
          label="Bespoke Bank Assignment"
          id="bank-account-assignment"
          labelId="bank-account-assignment-label"
          value={props.assignedBespokeBankAccount?.id || "None"}
          onChange={({ target: { value } }) => {
            assignBankAccount({
              variables: {
                bankAccountId: value === "None" ? null : value,
                companyId: props.companyId,
              },
              optimisticResponse: {
                update_companies_by_pk: {
                  id: props.companyId,
                  assigned_bespoke_bank_account_id:
                    value === "None" ? null : value,
                  assigned_bespoke_bank_account: data.bank_accounts.find(
                    (bank) => bank.id === value
                  ),
                },
              },
            });
          }}
        >
          <MenuItem key="none" value="None">
            None
          </MenuItem>
          {data.bank_accounts.map((bank_account) => {
            return (
              <MenuItem key={bank_account.id} value={bank_account.id}>
                {bank_account.bank_name} + {bank_account.account_type}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
      <Box mt={2} width="fit-content">
        {props.assignedBespokeBankAccount && (
          <AccountInfoCard
            bankAccount={props.assignedBespokeBankAccount}
          ></AccountInfoCard>
        )}
      </Box>
    </>
  );
}

export default BespokeBankAssignment;
