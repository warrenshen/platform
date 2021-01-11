import { Box, Card, CardContent } from "@material-ui/core";
import AccountInfo from "components/Shared/BankAccount/AccountInfo";
import { useBankAccountsQuery } from "generated/graphql";
import useAppBarTitle from "hooks/useAppBarTitle";
import AddBankAccountButton from "pages/Bank/BankAccounts/AddBankAccountButton";
import React from "react";
import { useTitle } from "react-use";

function BankAccounts() {
  useTitle("Bank Accounts | Bespoke");
  useAppBarTitle("Bank Accounts");

  const { data } = useBankAccountsQuery();
  const accounts = data?.company_bank_accounts || [];

  return (
    <>
      <Box display="flex" flexDirection="row-reverse" mb={3}>
        <AddBankAccountButton></AddBankAccountButton>
      </Box>
      <Box display="flex">
        {accounts.map((account, index) => (
          <Box key={index} mr={2}>
            <Card>
              <CardContent>
                <AccountInfo bankAccount={account}></AccountInfo>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </>
  );
}

export default BankAccounts;
