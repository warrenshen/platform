import { Box } from "@material-ui/core";
import AddAccountButton from "components/BankAccount/AddAccountButton";
import BankAccountInfoCard from "components/BankAccount/BankAccountInfoCard";
import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useBankAccountsQuery } from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import React, { useContext } from "react";

function BankAccounts() {
  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const { data } = useBankAccountsQuery();
  const accounts = data?.bank_accounts || [];

  return (
    <Page appBarTitle={"Bank Accounts"}>
      {check(role, Action.AddBankAccount) && (
        <Box display="flex" flexDirection="row-reverse" mb={3}>
          <AddAccountButton companyId={null} />
        </Box>
      )}
      <Box display="flex" flexWrap="wrap">
        {accounts.map((account, index) => (
          <Box key={index} mr={2} mb={2}>
            <BankAccountInfoCard
              bankAccount={account}
              isEditAllowed={check(role, Action.EditBankAccount)}
            />
          </Box>
        ))}
      </Box>
    </Page>
  );
}

export default BankAccounts;
