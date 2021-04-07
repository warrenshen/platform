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
import { useContext, useMemo, useState } from "react";

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

  const { data: bankAccountsData, refetch } = useGetBespokeBankAccountsQuery();
  const accounts = bankAccountsData?.bank_accounts || [];

  const {
    data: usersData,
    refetch: refetchBankUsers,
  } = useGetUsersByRolesQuery({
    variables: {
      roles: [UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly],
    },
  });

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
          <h2>Bank Accounts</h2>
          <Can perform={Action.AddBankAccount}>
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
          </Can>
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
        </Box>
        <Box className={classes.sectionSpace} />
        <Box className={classes.section}>
          <h2>Users</h2>
          <Can perform={Action.ManipulateUser}>
            <Box
              display="flex"
              style={{ marginBottom: "1rem" }}
              flexDirection="row-reverse"
            >
              <ModalButton
                isDisabled={selectedUsers.length > 0}
                label={"Invite User"}
                modal={({ handleClose }) => (
                  <InviteUserModal
                    companyId={null}
                    userRoles={[
                      UserRolesEnum.BankAdmin,
                      UserRolesEnum.BankReadOnly,
                    ]}
                    handleClose={() => {
                      refetchBankUsers();
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
                      originalUserProfile={selectedUsers[0]}
                      handleClose={() => {
                        refetchBankUsers();
                        handleClose();
                      }}
                    />
                  )}
                />
              </Box>
            </Box>
          </Can>
          <UsersDataGrid
            isCompanyVisible
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
