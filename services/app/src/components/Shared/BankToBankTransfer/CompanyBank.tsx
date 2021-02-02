import { Box, FormControl, MenuItem, Select } from "@material-ui/core";
import BankAccountInfoCard from "components/Shared/BankAccount/BankAccountInfoCard";
import {
  BankAccounts,
  Companies,
  useListBankAccountsQuery,
} from "generated/graphql";
import { useEffect, useState } from "react";

interface Props {
  companyId: Companies["id"];
  onCompanyBankAccountSelection: (id: BankAccounts["id"]) => void;
}

function CompanyBank({ companyId, onCompanyBankAccountSelection }: Props) {
  const { data } = useListBankAccountsQuery({
    variables: {
      companyId: companyId,
    },
  });

  const [companyBankAccountId, setCompanyBankAccountId] = useState<
    BankAccounts["id"] | "None"
  >("None");

  useEffect(() => {
    if (data?.bank_accounts.length === 1 && companyBankAccountId === "None") {
      const id = data?.bank_accounts[0].id;
      setCompanyBankAccountId(id);
      onCompanyBankAccountSelection(id);
    }
  }, [
    companyBankAccountId,
    data?.bank_accounts,
    onCompanyBankAccountSelection,
  ]);

  if (!data || !data.bank_accounts) {
    return null;
  }

  const companyBankAccount = data.bank_accounts.find(
    (bank_account) => bank_account.id === companyBankAccountId
  );

  return (
    <Box>
      <FormControl fullWidth style={{ width: 200 }}>
        {/* <InputLabel id="bank-account-assignment-label">
          Bespoke Bank Assignment
        </InputLabel> */}
        <Select
          // label="Bespoke Bank Assignment"
          // id="bank-account-assignment"
          // labelId="bank-account-assignment-label"
          value={companyBankAccountId}
          onChange={({ target: { value } }) => {
            setCompanyBankAccountId(value);
            onCompanyBankAccountSelection(value);
          }}
        >
          <MenuItem key="none" value="None">
            None
          </MenuItem>
          {data.bank_accounts.map((bank_account) => {
            return (
              <MenuItem key={bank_account.id} value={bank_account.id}>
                {`${bank_account.bank_name}: ${bank_account.account_title} (${bank_account.account_type})`}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
      {companyBankAccount && (
        <Box mt={1} width="fit-content">
          <BankAccountInfoCard
            isEditAllowed={false}
            bankAccount={companyBankAccount}
          ></BankAccountInfoCard>
        </Box>
      )}
    </Box>
  );
}

export default CompanyBank;
