import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core";
import AccountInfoCard from "components/Shared/BankAccount/AccountInfoCard";
import {
  BankAccounts,
  Companies,
  useBankAccountsForTransferQuery,
} from "generated/graphql";
import { useEffect, useState } from "react";

interface Props {
  companyId: Companies["id"];
}

function BespokeBank(props: Props) {
  const { data } = useBankAccountsForTransferQuery({
    variables: {
      companyId: props.companyId,
    },
  });

  useEffect(() => {
    if (data?.companies_by_pk?.assigned_bespoke_bank_account) {
      setBespokeBankAccountId(
        data?.companies_by_pk?.assigned_bespoke_bank_account.id
      );
    }
  }, [data?.companies_by_pk?.assigned_bespoke_bank_account]);

  const [bespokeBankAccountId, setBespokeBankAccountId] = useState<
    BankAccounts["id"] | "None"
  >("None");

  if (!data || !data.bank_accounts) {
    return null;
  }

  const bespokeBankAccount = data.bank_accounts.find(
    (bank_account) => bank_account.id === bespokeBankAccountId
  );

  return (
    <Box>
      <FormControl fullWidth style={{ width: 200 }}>
        <InputLabel id="bank-account-assignment-label">
          Bespoke Bank Assignment
        </InputLabel>
        <Select
          label="Bespoke Bank Assignment"
          id="bank-account-assignment"
          labelId="bank-account-assignment-label"
          value={bespokeBankAccountId}
          onChange={({ target: { value } }) => {
            setBespokeBankAccountId(value);
          }}
        >
          <MenuItem key="none" value="None">
            None
          </MenuItem>
          {data.bank_accounts.map((bank_account) => {
            return (
              <MenuItem key={bank_account.id} value={bank_account.id}>
                {bank_account.bank_name} ({bank_account.account_type})
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
      {bespokeBankAccount && (
        <Box mt={1} width="fit-content">
          <AccountInfoCard
            bankAccount={bespokeBankAccount}
            disableEditing
          ></AccountInfoCard>
        </Box>
      )}
    </Box>
  );
}

export default BespokeBank;
