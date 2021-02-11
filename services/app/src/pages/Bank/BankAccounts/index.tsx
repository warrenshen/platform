import { Box } from "@material-ui/core";
import AddAccountButton from "components/Shared/BankAccount/AddAccountButton";
import BankAccountInfoCard from "components/Shared/BankAccount/BankAccountInfoCard";
import Page from "components/Shared/Page";
import { useBankAccountsQuery } from "generated/graphql";
import React from "react";

function BankAccounts() {
  const { data } = useBankAccountsQuery();
  const accounts = data?.bank_accounts || [];

  return (
    <Page appBarTitle={"Bank Accounts"}>
      <Box display="flex" flexDirection="row-reverse" mb={3}>
        <AddAccountButton companyId={null}></AddAccountButton>
      </Box>
      <Box display="flex" flexWrap="wrap">
        {accounts.map((account, index) => (
          <Box key={index} mr={2} mb={2}>
            <BankAccountInfoCard bankAccount={account}></BankAccountInfoCard>
          </Box>
        ))}
      </Box>
    </Page>
  );
}

export default BankAccounts;
