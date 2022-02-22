import { Box, createStyles, makeStyles, Theme } from "@material-ui/core";
import CreateUpdateBankAccountModal from "components/BankAccount/CreateUpdateBankAccountModal";
import DeleteBankAccountModal from "components/BankAccount/DeleteBankAccountModal";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import EditUserProfileModal from "components/Users/EditUserProfileModal";
import InviteUserModal from "components/Users/InviteUserModal";
import UsersDataGrid from "components/Users/UsersDataGrid";
import BankAccountsDataGrid from "components/BankAccounts/BankAccountsDataGrid";
import {
  useGetBespokeBankAccountsQuery,
  useGetUsersByRolesQuery,
  UserRolesEnum,
  Users,
  BankAccounts,
  BankAccountFragment,
} from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { BankUserRoles } from "lib/enum";
import { useCallback, useMemo, useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: "flex",
      flexDirection: "column",

      width: "100%",
    },
    section: {
      display: "flex",
      flexDirection: "column",
    },
    sectionSpace: {
      marginBottom: theme.spacing(4),
    },
    inputField: {
      width: 300,
    },
  })
);

export default function BankSettingsPage() {
  const classes = useStyles();

  const {
    data: bankAccountsData,
    refetch: refetchBankAccounts,
  } = useGetBespokeBankAccountsQuery();
  const accounts = useMemo(() => bankAccountsData?.bank_accounts || [], [
    bankAccountsData,
  ]);

  const { data: usersData, refetch: refetchUsers } = useGetUsersByRolesQuery({
    variables: {
      roles: [UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly],
    },
  });

  const refetch = useCallback(() => {
    refetchBankAccounts();
    refetchUsers();
  }, [refetchBankAccounts, refetchUsers]);

  const users = usersData?.users || [];

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

  const [selectedBankAccountIds, setSelectedBankAccountIds] = useState<
    BankAccounts["id"]
  >([]);

  const selectedBankAccount = useMemo(
    () =>
      selectedBankAccountIds.length === 1
        ? accounts.find((account) => account.id === selectedBankAccountIds[0])
        : null,
    [accounts, selectedBankAccountIds]
  );

  const handleSelectBankAccounts = useMemo(
    () => (accounts: BankAccountFragment[]) => {
      setSelectedBankAccountIds(accounts.map((account) => account.id));
    },
    [setSelectedBankAccountIds]
  );

  return (
    <Page appBarTitle={"Settings"}>
      <PageContent title={"Settings"}>
        <Box className={classes.section}>
          <h2>Bespoke Financial Bank Accounts</h2>

          <Box mb={2} display="flex" flexDirection="row-reverse">
            <Can perform={Action.AddBankAccount}>
              <Box>
                <ModalButton
                  label={"Add BF Bank Account"}
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
            </Can>
            <Can perform={Action.EditBankAccount}>
              <Box mr={2}>
                <ModalButton
                  isDisabled={selectedBankAccountIds.length !== 1}
                  label={"Edit Bank Account"}
                  modal={({ handleClose }) => (
                    <CreateUpdateBankAccountModal
                      companyId={null}
                      existingBankAccount={
                        selectedBankAccount as BankAccountFragment
                      }
                      handleClose={() => {
                        refetchBankAccounts();
                        handleClose();
                      }}
                    />
                  )}
                />
              </Box>
            </Can>
            <Can perform={Action.DeleteBankAccount}>
              <Box mr={2}>
                <ModalButton
                  isDisabled={selectedBankAccountIds.length !== 1}
                  label={"Delete Bank Account"}
                  variant={"outlined"}
                  modal={({ handleClose }) => (
                    <DeleteBankAccountModal
                      bankAccount={selectedBankAccount as BankAccountFragment}
                      handleClose={() => {
                        refetchBankAccounts();
                        handleClose();
                      }}
                    />
                  )}
                />
              </Box>
            </Can>
          </Box>
        </Box>

        <Box display="flex" flexDirection="column">
          <BankAccountsDataGrid
            bankAccounts={accounts}
            selectedBankAccountIds={selectedBankAccountIds}
            handleSelectBankAccounts={handleSelectBankAccounts}
          />
        </Box>

        <Box className={classes.sectionSpace} />
        <Box className={classes.section}>
          <h2>Bespoke Financial Users</h2>
          <Can perform={Action.ManipulateUser}>
            <Box display="flex" flexDirection="row-reverse" mb={2}>
              <ModalButton
                isDisabled={selectedUsers.length > 0}
                label={"Create BF User"}
                modal={({ handleClose }) => (
                  <InviteUserModal
                    companyId={null}
                    userRoles={BankUserRoles}
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
                  label={"Edit BF User"}
                  modal={({ handleClose }) => (
                    <EditUserProfileModal
                      userId={selectedUsers[0].id}
                      userRoles={BankUserRoles}
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
            </Box>
          </Can>
          <UsersDataGrid
            isMultiSelectEnabled
            isRoleVisible
            users={users}
            selectedUserIds={selectedUserIds}
            handleSelectUsers={handleSelectUsers}
          />
        </Box>
      </PageContent>
    </Page>
  );
}
