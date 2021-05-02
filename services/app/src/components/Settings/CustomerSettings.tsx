import { Box, Typography } from "@material-ui/core";
import BankAccountInfoCard from "components/BankAccount/BankAccountInfoCard";
import CreateUpdateBankAccountModal from "components/BankAccount/CreateUpdateBankAccountModal";
import CompanySettingsCard from "components/Settings/CompanySettingsCard";
import EditCustomerSettingsModal from "components/Settings/EditCustomerSettingsModal";
import Can from "components/Shared/Can";
import CompanyInfo from "components/Shared/CompanyProfile/CompanyInfo";
import ModalButton from "components/Shared/Modal/ModalButton";
import EditUserProfileModal from "components/Users/EditUserProfileModal";
import InviteUserModal from "components/Users/InviteUserModal";
import UsersDataGrid from "components/Users/UsersDataGrid";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  BankAccountFragment,
  CompanyFragment,
  CompanySettingsForCustomerFragment,
  CompanySettingsFragment,
  ContractFragment,
  useListUsersByCompanyIdQuery,
  Users,
} from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { CompanyUserRoles } from "lib/enum";
import { useContext, useMemo, useState } from "react";

interface Props {
  companyId: string;
  company: CompanyFragment;
  settings: CompanySettingsFragment | CompanySettingsForCustomerFragment;
  contract: ContractFragment | null;
  bankAccounts: BankAccountFragment[];
  handleDataChange: () => void;
}

function Settings({
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

  const { data, refetch } = useListUsersByCompanyIdQuery({
    variables: {
      companyId,
    },
  });

  const users = data?.users || [];

  const [selectedUsers, setSelectedUsers] = useState<Users[]>([]);

  const selectedUserIds = useMemo(() => selectedUsers.map((user) => user.id), [
    selectedUsers,
  ]);

  const handleSelectUsers = useMemo(
    () => (users: Users[]) => {
      setSelectedUsers(users);
    },
    [setSelectedUsers]
  );

  return (
    <Box>
      <Box>
        <h2>Customer Settings</h2>
        <Box mt={3}>
          <CompanyInfo
            company={company}
            isEditAllowed={check(role, Action.EditBankAccount)}
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
            handleClick={() => {
              setAccountSettingsOpen(true);
            }}
          />
        </Box>
      </Box>
      <Box>
        <h2>Bank Accounts</h2>
        <Can perform={Action.AddBankAccount}>
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
                />
              </Box>
            ))
          ) : (
            <Typography variant="body2">No bank accounts set up yet</Typography>
          )}
        </Box>
      </Box>
      <Box>
        <h2>Users</h2>
        <Box display="flex" flexDirection="row-reverse">
          <Can perform={Action.ManipulateUser}>
            <ModalButton
              isDisabled={selectedUsers.length > 0}
              label={"Invite User"}
              modal={({ handleClose }) => (
                <InviteUserModal
                  companyId={companyId}
                  userRoles={CompanyUserRoles}
                  handleClose={() => {
                    refetch();
                    handleClose();
                  }}
                />
              )}
            />
          </Can>
          <Can perform={Action.ManipulateUser}>
            <Box mr={2}>
              <ModalButton
                isDisabled={selectedUsers.length !== 1}
                label={"Edit User"}
                modal={({ handleClose }) => (
                  <EditUserProfileModal
                    userId={selectedUsers[0].id}
                    userRoles={CompanyUserRoles}
                    originalUserProfile={selectedUsers[0]}
                    handleClose={() => {
                      refetch();
                      handleClose();
                      setSelectedUsers([]);
                    }}
                  />
                )}
              />
            </Box>
          </Can>
        </Box>
        <Box display="flex" mt={3}>
          {users.length > 0 ? (
            <UsersDataGrid
              isCompanyVisible={false}
              isMultiSelectEnabled
              users={users}
              selectedUserIds={selectedUserIds}
              handleSelectUsers={handleSelectUsers}
            />
          ) : (
            <Typography variant="body2">No users set up yet</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default Settings;
