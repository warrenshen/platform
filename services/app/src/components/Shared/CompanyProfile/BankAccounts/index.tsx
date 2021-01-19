import { Box } from "@material-ui/core";
import AccountInfoCard from "components/Shared/BankAccount/AccountInfoCard";
import AddAccountButton from "components/Shared/BankAccount/AddAccountButton";
import { BankAccountFragment } from "generated/graphql";
import { useEffect, useState } from "react";
interface Props {
  companyId: string;
  bankAccounts: BankAccountFragment[];
}

function BankAccounts({ companyId, bankAccounts }: Props) {
  const [accounts, setAccounts] = useState(
    bankAccounts.map((bankAccount) => {
      return { addNew: false, bankAccount: bankAccount };
    })
  );

  useEffect(() => {
    setAccounts(
      bankAccounts.map((bankAccount) => {
        return { addNew: false, bankAccount: bankAccount };
      })
    );
  }, [bankAccounts]);

  return (
    <Box mt={4}>
      <AddAccountButton companyId={companyId}></AddAccountButton>
      <Box display="flex" mt={2}>
        {accounts.map((account, index) => (
          <Box mr={2} key={index}>
            <AccountInfoCard
              bankAccount={account.bankAccount}
            ></AccountInfoCard>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default BankAccounts;
