import { Box, Theme, createStyles, makeStyles } from "@material-ui/core";
import CreateUpdateBankAccountModal from "components/BankAccount/CreateUpdateBankAccountModal";
import DeleteBankAccountModal from "components/BankAccount/DeleteBankAccountModal";
import BankAccountsDataGrid from "components/BankAccounts/BankAccountsDataGrid";
import ManageBankUsersArea from "components/Settings/ManageBankUsersArea";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import {
  BankAccountFragment,
  BankAccounts,
  useGetBespokeBankAccountsQuery,
} from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
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

  const { data: bankAccountsData, refetch: refetchBankAccounts } =
    useGetBespokeBankAccountsQuery();
  const accounts = useMemo(
    () => bankAccountsData?.bank_accounts || [],
    [bankAccountsData]
  );

  const refetch = useCallback(() => {
    refetchBankAccounts();
  }, [refetchBankAccounts]);

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
          <ManageBankUsersArea />
        </Box>
      </PageContent>
    </Page>
  );
}
