import { Box } from "@material-ui/core";
import BankAccountInfoCard from "components/BankAccount/BankAccountInfoCard";
import CreateUpdateBankAccountModal from "components/BankAccount/CreateUpdateBankAccountModal";
import ModalButton from "components/Shared/Modal/ModalButton";
import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useGetBespokeBankAccountsQuery } from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { useContext } from "react";

function BankAccounts() {
  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const { data, refetch } = useGetBespokeBankAccountsQuery();
  const accounts = data?.bank_accounts || [];

  return (
    <Page appBarTitle={"Bank Accounts"}>
      {check(role, Action.AddBankAccount) && (
        <Box display="flex" flexDirection="row-reverse" mb={3}>
          <ModalButton
            label={"Add Bank Account"}
            modal={({ handleClose }) => (
              <CreateUpdateBankAccountModal
                companyId={null}
                existingBankAccount={null}
                handleClose={() => {
                  refetch();
                  handleClose();
                }}
              />
            )}
          />
        </Box>
      )}
      <Box display="flex" flexWrap="wrap">
        {accounts.map((account, index) => (
          <Box key={index} mr={2} mb={2}>
            <BankAccountInfoCard
              isCannabisCompliantVisible
              isEditAllowed={check(role, Action.EditBankAccount)}
              isVerificationVisible
              bankAccount={account}
            />
          </Box>
        ))}
      </Box>
    </Page>
  );
}

export default BankAccounts;
