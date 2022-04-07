import { Box, Button, makeStyles, MenuItem, Select } from "@material-ui/core";
import BankAccountInfoCard from "components/BankAccount/BankAccountInfoCard";
import CreateUpdateBankAccountModal from "components/BankAccount/CreateUpdateBankAccountModal";
import Can from "components/Shared/Can";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  BankAccountFragment,
  BankAccounts,
  Companies,
  CompanyVendorPartnerships,
  useChangeBankAccountMutation,
  useCompanyBankAccountsQuery,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import { Action, check } from "lib/auth/rbac-rules";
import { useContext, useState } from "react";

const useStyles = makeStyles({
  baseInput: {
    width: 300,
  },
  selectInput: {
    height: 30,
  },
});

interface Props {
  companyId: Companies["id"];
  companyVendorPartnershipId: CompanyVendorPartnerships["id"];
  bankAccount?: BankAccountFragment | null;
  handleDataChange: () => void;
}

export default function BankAccount({
  companyId,
  companyVendorPartnershipId,
  bankAccount,
  handleDataChange,
}: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const [addingNewAccount, setAddingNewAccount] = useState(false);

  const { data, refetch } = useCompanyBankAccountsQuery({
    variables: {
      companyId,
    },
  });
  const [changeBankAccount] = useChangeBankAccountMutation();

  const handleChangeBankAccount = async (bankAccountId: BankAccounts["id"]) => {
    const response = await changeBankAccount({
      variables: {
        bankAccountId: bankAccountId,
        companyVendorPartnershipId: companyVendorPartnershipId,
      },
    });

    if (!response.data?.update_company_vendor_partnerships_by_pk) {
      snackbar.showError(`Could not assign bank account`);
    } else {
      snackbar.showSuccess(`Bank account assignment saved.`);
      handleDataChange();
    }
  };

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" mt={1}>
        {data?.bank_accounts.length ? (
          <Box mr={1}>
            <Select
              data-cy="bank-account-selector"
              className={classes.selectInput}
              variant="outlined"
              value={bankAccount?.id || "None"}
              onChange={({ target: { value } }) =>
                handleChangeBankAccount(value === "None" ? null : value)
              }
            >
              <MenuItem key="none" value="None">
                {`None (${data.bank_accounts.length} available)`}
              </MenuItem>
              {data.bank_accounts.map((bank_account) => {
                return (
                  <MenuItem
                    key={bank_account.id}
                    value={bank_account.id}
                    data-cy={`bank-account-selector-item-${bank_account.account_number}`}
                  >
                    {`${bank_account.bank_name}: ${bank_account.account_title} (${bank_account.account_type})`}
                  </MenuItem>
                );
              })}
            </Select>
          </Box>
        ) : null}
        <Can perform={Action.AddBankAccount}>
          <Button
            size="small"
            disabled={addingNewAccount}
            variant="outlined"
            onClick={() => {
              setAddingNewAccount(true);
            }}
          >
            New
          </Button>
        </Can>
      </Box>
      <Box mb={3}>
        {addingNewAccount && (
          <CreateUpdateBankAccountModal
            companyId={companyId}
            existingBankAccount={null}
            handleClose={() => {
              refetch();
              setAddingNewAccount(false);
            }}
          />
        )}
        {!!bankAccount && (
          <Box width="fit-content" mt={2}>
            <BankAccountInfoCard
              isCannabisCompliantVisible
              isEditAllowed={check(role, Action.EditBankAccount)}
              isVerificationVisible
              bankAccount={bankAccount}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
