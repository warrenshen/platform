import { Box, Typography } from "@material-ui/core";
import BankAccountInfoCard from "components/BankAccount/BankAccountInfoCard";
import CreateUpdateBankAccountModal from "components/BankAccount/CreateUpdateBankAccountModal";
import CompanySettingsCard from "components/Settings/CompanySettingsCard";
import EditCustomerSettingsModal from "components/Settings/EditCustomerSettingsModal";
import ManageUsersArea from "components/Settings/ManageUsersArea";
import AssignAdvancesBankAccount from "components/Shared/BankAssignment/AssignAdvancesBankAccount";
import AssignCollectionsBankAccount from "components/Shared/BankAssignment/AssignCollectionsBankAccount";
import Can from "components/Shared/Can";
import CompanyInfo from "components/Shared/CompanyProfile/CompanyInfo";
import ModalButton from "components/Shared/Modal/ModalButton";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  BankAccountFragment,
  ContractFragment,
  GetCompanyForCustomerQuery,
} from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { useContext, useState } from "react";

interface Props {
  companyId: string;
  company: NonNullable<GetCompanyForCustomerQuery["companies_by_pk"]>;
  settings: NonNullable<
    GetCompanyForCustomerQuery["companies_by_pk"]
  >["settings"];
  contract: ContractFragment | null;
  bankAccounts: BankAccountFragment[];
  handleDataChange: () => void;
}

export default function CustomerSettings({
  companyId,
  company,
  settings,
  contract,
  bankAccounts,
  handleDataChange,
}: Props) {
  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);

  if (!settings) {
    return null;
  }

  return (
    <Box>
      <Box>
        <h2>General</h2>
        <Box mt={3}>
          <CompanyInfo
            isEditAllowed={check(role, Action.EditBankAccount)}
            company={company}
            handleDataChange={handleDataChange}
          />
        </Box>
        <Box mt={3}>
          {accountSettingsOpen && (
            <EditCustomerSettingsModal
              contract={contract}
              companyId={companyId}
              existingSettings={settings}
              handleClose={() => {
                handleDataChange();
                setAccountSettingsOpen(false);
              }}
            />
          )}
          <CompanySettingsCard
            contract={contract}
            settings={settings}
            handleClick={() => setAccountSettingsOpen(true)}
          />
        </Box>
      </Box>
      <Can perform={Action.AddBankAccount}>
        <Box mt={4}>
          <h2>Configured Bank Accounts</h2>
          <Typography variant="body2">
            Advances Bank Account: bank account that Bespoke Financial will send
            advances to.
          </Typography>
          <Typography variant="body2">
            Repayments Bank Account: bank account that you want Bespoke
            Financial to initiate reverse draft ACHs from.
          </Typography>
          <Box display="flex" mt={2}>
            <Box display="flex" mr={2}>
              <AssignAdvancesBankAccount
                companyId={companyId}
                companySettingsId={settings.id}
                assignedBankAccount={settings.advances_bank_account || null}
                handleDataChange={handleDataChange}
              />
            </Box>
            <Box display="flex">
              <AssignCollectionsBankAccount
                companyId={companyId}
                companySettingsId={settings.id}
                assignedBankAccount={settings.collections_bank_account || null}
                handleDataChange={handleDataChange}
              />
            </Box>
          </Box>
        </Box>
      </Can>
      <Box mt={4}>
        <h2>All Bank Accounts</h2>
        <Can perform={Action.AddBankAccount}>
          <Box mt={2}>
            <ModalButton
              label={"Add Bank Account"}
              modal={({ handleClose }) => (
                <CreateUpdateBankAccountModal
                  companyId={companyId}
                  existingBankAccount={null}
                  handleClose={() => {
                    handleDataChange();
                    handleClose();
                  }}
                />
              )}
            />
          </Box>
        </Can>
        <Box display="flex" mt={3}>
          {bankAccounts.length > 0 ? (
            bankAccounts.map((bankAccount, index) => (
              <Box mr={2} key={index}>
                <BankAccountInfoCard
                  isCannabisCompliantVisible
                  isEditAllowed={check(role, Action.EditBankAccount)}
                  isVerificationVisible
                  bankAccount={bankAccount}
                  handleDataChange={handleDataChange}
                />
              </Box>
            ))
          ) : (
            <Typography variant="body2">No bank accounts set up yet</Typography>
          )}
        </Box>
      </Box>
      <Box mt={4}>
        <ManageUsersArea company={company} />
      </Box>
    </Box>
  );
}
