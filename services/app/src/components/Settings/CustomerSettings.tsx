import { Box } from "@material-ui/core";
import BankAccountInfoCard from "components/BankAccount/BankAccountInfoCard";
import CreateUpdateBankAccountModal from "components/BankAccount/CreateUpdateBankAccountModal";
import CompanySettingsCard from "components/Settings/CompanySettingsCard";
import EditCompanySettingsModal from "components/Settings/EditCompanySettingsModal";
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
  UserRolesEnum,
  Users,
} from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
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
  const [selectedUserIds, setSelectedUserIds] = useState<Users["id"]>([]);

  const handleSelectUsers = useMemo(
    () => (users: Users[]) => {
      setSelectedUsers(users);
      setSelectedUserIds(users.map((user) => user.id));
    },
    [setSelectedUserIds]
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
            <EditCompanySettingsModal
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
          {bankAccounts.map((bankAccount, index) => (
            <Box mr={2} key={index}>
              <BankAccountInfoCard
                isCannabisCompliantVisible
                isEditAllowed={check(role, Action.EditBankAccount)}
                isVerificationVisible
                bankAccount={bankAccount}
              />
            </Box>
          ))}
        </Box>
      </Box>
      <Box>
        <h2>Users</h2>
        <Box display="flex" flexDirection="row-reverse">
          <ModalButton
            label={"Invite User"}
            modal={({ handleClose }) => (
              <InviteUserModal
                companyId={companyId}
                userRoles={[
                  UserRolesEnum.CompanyAdmin,
                  UserRolesEnum.CompanyReadOnly,
                ]}
                handleClose={() => {
                  refetch();
                  handleClose();
                }}
              />
            )}
          />
          <Box mr={2}>
            <ModalButton
              isDisabled={selectedUsers.length !== 1}
              label={"Edit User"}
              modal={({ handleClose }) => (
                <EditUserProfileModal
                  userId={selectedUsers[0].id}
                  companyId={companyId}
                  originalUserProfile={selectedUsers[0]}
                  handleClose={() => {
                    refetch();
                    handleClose();
                  }}
                />
              )}
            />
          </Box>
        </Box>
        <Box display="flex" mt={3}>
          <UsersDataGrid
            isCompanyVisible={false}
            isMultiSelectEnabled
            users={users}
            selectedUserIds={selectedUserIds}
            handleSelectUsers={handleSelectUsers}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default Settings;
