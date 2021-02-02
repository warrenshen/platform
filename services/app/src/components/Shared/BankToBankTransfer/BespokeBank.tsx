import { Box, FormControl, MenuItem, Select } from "@material-ui/core";
import BankAccountInfoCard from "components/Shared/BankAccount/BankAccountInfoCard";
import {
  BankAccounts,
  Companies,
  useBankAccountsForTransferQuery,
} from "generated/graphql";
import { useEffect, useState } from "react";

interface Props {
  companyId: Companies["id"];
  onBespokeBankAccountSelection: (id: BankAccounts["id"]) => void;
}

function BespokeBank({ companyId, onBespokeBankAccountSelection }: Props) {
  const { data } = useBankAccountsForTransferQuery({
    variables: {
      companyId: companyId,
    },
  });

  const [bespokeBankAccountId, setBespokeBankAccountId] = useState<
    BankAccounts["id"] | "None"
  >("None");

  useEffect(() => {
    if (
      data?.companies_by_pk?.settings?.collections_bespoke_bank_account &&
      bespokeBankAccountId === "None"
    ) {
      const id =
        data?.companies_by_pk?.settings?.collections_bespoke_bank_account.id;
      setBespokeBankAccountId(id);
      onBespokeBankAccountSelection(id);
    }
  }, [
    bespokeBankAccountId,
    data?.companies_by_pk?.settings?.collections_bespoke_bank_account,
    onBespokeBankAccountSelection,
  ]);

  if (!data || !data.bank_accounts) {
    return null;
  }

  const bespokeBankAccount = data.bank_accounts.find(
    (bank_account) => bank_account.id === bespokeBankAccountId
  );

  return (
    <Box>
      <FormControl fullWidth style={{ width: 200 }}>
        {/* <InputLabel id="bank-account-assignment-label">
          Bespoke Bank Assignment
        </InputLabel> */}
        <Select
          // id="bank-account-assignment"
          // labelId="bank-account-assignment-label"
          value={bespokeBankAccountId}
          onChange={({ target: { value } }) => {
            setBespokeBankAccountId(value);
            onBespokeBankAccountSelection(value);
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
      {bespokeBankAccount && (
        <Box mt={1} width="fit-content">
          <BankAccountInfoCard
            isEditAllowed={false}
            bankAccount={bespokeBankAccount}
          ></BankAccountInfoCard>
        </Box>
      )}
    </Box>
  );
}

export default BespokeBank;
