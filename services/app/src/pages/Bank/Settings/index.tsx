import { Box, createStyles, makeStyles, Theme } from "@material-ui/core";
import BankAccountInfoCard from "components/BankAccount/BankAccountInfoCard";
import CreateUpdateBankAccountModal from "components/BankAccount/CreateUpdateBankAccountModal";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import EditUserProfileModal from "components/Users/EditUserProfileModal";
import InviteUserModal from "components/Users/InviteUserModal";
import UsersDataGrid from "components/Users/UsersDataGrid";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  useGetBespokeBankAccountsQuery,
  useGetUsersByRolesQuery,
  UserRolesEnum,
  Users,
} from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { BankUserRoles } from "lib/enum";
import { useCallback, useContext, useMemo, useState } from "react";

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
function BankSettingsPage() {
  const classes = useStyles();

  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const {
    data: bankAccountsData,
    refetch: refetchBankAccounts,
  } = useGetBespokeBankAccountsQuery();
  const accounts = bankAccountsData?.bank_accounts || [];

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

  return (
    <Page appBarTitle={"Settings"}>
      <PageContent title={"Settings"}>
        <Box className={classes.section}>
          <h2>Bespoke Financial Bank Accounts</h2>
          <Can perform={Action.AddBankAccount}>
            <Box display="flex" flexDirection="row-reverse" mb={3}>
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
          <Box display="flex" flexWrap="wrap">
            {accounts.map((account, index) => (
              <Box key={index} mr={2} mb={2}>
                <BankAccountInfoCard
                  isCannabisCompliantVisible
                  isEditAllowed={check(role, Action.EditBankAccount)}
                  isVerificationVisible
                  bankAccount={account}
                  handleDataChange={refetchBankAccounts}
                />
              </Box>
            ))}
          </Box>
        </Box>
        <Box className={classes.sectionSpace} />
        <Box className={classes.section}>
          <h2>Bespoke Financial Users</h2>
          <Can perform={Action.ManipulateUser}>
            <Box display="flex" flexDirection="row-reverse" mb={2}>
              <ModalButton
                isDisabled={selectedUsers.length > 0}
                label={"Invite BF User"}
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
            users={users}
            selectedUserIds={selectedUserIds}
            handleSelectUsers={handleSelectUsers}
          />
        </Box>
      </PageContent>
    </Page>
  );
}

export default BankSettingsPage;
