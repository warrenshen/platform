import { Box, Typography } from "@material-ui/core";
import CreateUpdateBankAccountModal from "components/BankAccount/CreateUpdateBankAccountModal";
import DeleteBankAccountModal from "components/BankAccount/DeleteBankAccountModal";
import UpdateAllVendorPartnershipModal from "components/BankAccount/UpdateAllVendorPartnershipModal";
import BankAccountsDataGrid from "components/BankAccounts/BankAccountsDataGrid";
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
  BankAccounts,
  ContractFragment,
  GetCompanyForCustomerQuery,
} from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { PlatformModeEnum } from "lib/enum";
import { useContext, useMemo, useState } from "react";

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
    user: { role, platformMode },
  } = useContext(CurrentUserContext);
  const isBankUser = platformMode === PlatformModeEnum.Bank;

  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);

  const [selectedBankAccountIds, setSelectedBankAccountIds] = useState<
    BankAccounts["id"]
  >([]);

  const selectedBankAccount = useMemo(
    () =>
      selectedBankAccountIds.length === 1
        ? bankAccounts.find(
            (bankAccount) => bankAccount.id === selectedBankAccountIds[0]
          )
        : null,
    [bankAccounts, selectedBankAccountIds]
  );

  const handleSelectBankAccounts = useMemo(
    () => (accounts: BankAccountFragment[]) => {
      setSelectedBankAccountIds(accounts.map((account) => account.id));
    },
    [setSelectedBankAccountIds]
  );

  if (!settings) {
    return null;
  }
  const isVendorCompany = company.is_vendor;
  const isVendorOrActiveCustomer = isVendorCompany || !!contract;

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
              isBankUser={isBankUser}
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
        <Box mb={2} display="flex" flexDirection="row-reverse">
          <Can perform={Action.AddBankAccount}>
            <Box>
              <ModalButton
                dataCy={"add-bank-account-button"}
                label={"Add Bank Account"}
                isDisabled={!isVendorOrActiveCustomer}
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
          <Can perform={Action.EditBankAccount}>
            <Box mr={2}>
              <ModalButton
                dataCy={"edit-bank-account-button"}
                isDisabled={
                  selectedBankAccountIds.length !== 1 ||
                  !isVendorOrActiveCustomer
                }
                label={"Edit Bank Account"}
                modal={({ handleClose }) => (
                  <CreateUpdateBankAccountModal
                    companyId={companyId}
                    existingBankAccount={
                      selectedBankAccount as BankAccountFragment
                    }
                    handleClose={() => {
                      handleDataChange();
                      handleClose();
                    }}
                  />
                )}
              />
            </Box>
          </Can>
          {isBankUser && isVendorCompany && (
            <Can perform={Action.UseBankAccountForAllPartnerships}>
              <Box mr={2}>
                <ModalButton
                  dataCy={"use-bank-account-for-all-partnerships-button"}
                  label={"Use For All Vendor Partnerships"}
                  isDisabled={
                    selectedBankAccountIds.length !== 1 ||
                    !isVendorOrActiveCustomer
                  }
                  modal={({ handleClose }) => (
                    <UpdateAllVendorPartnershipModal
                      bankAccount={selectedBankAccount as BankAccountFragment}
                      handleClose={() => {
                        handleDataChange();
                        handleClose();
                      }}
                    />
                  )}
                />
              </Box>
            </Can>
          )}
          <Can perform={Action.DeleteBankAccount}>
            <Box mr={2}>
              <ModalButton
                dataCy={"delete-bank-account-button"}
                isDisabled={
                  selectedBankAccountIds.length !== 1 ||
                  !isVendorOrActiveCustomer
                }
                label={"Delete Bank Account"}
                variant={"outlined"}
                modal={({ handleClose }) => (
                  <DeleteBankAccountModal
                    bankAccount={selectedBankAccount as BankAccountFragment}
                    handleClose={() => {
                      handleDataChange();
                      handleClose();
                    }}
                  />
                )}
              />
            </Box>
          </Can>
        </Box>

        <Box data-cy="bank-accounts-data-grid" display="flex" mt={3}>
          <BankAccountsDataGrid
            bankAccounts={bankAccounts}
            selectedBankAccountIds={selectedBankAccountIds}
            handleSelectBankAccounts={handleSelectBankAccounts}
          />
        </Box>
      </Box>
      <Box mt={4}>
        <ManageUsersArea
          company={company}
          isVendorOrActiveCustomer={isVendorOrActiveCustomer}
        />
      </Box>
    </Box>
  );
}
