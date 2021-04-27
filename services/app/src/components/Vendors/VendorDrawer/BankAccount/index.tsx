import { Box, Button, makeStyles, MenuItem, Select } from "@material-ui/core";
import BankAccountInfoCard from "components/BankAccount/BankAccountInfoCard";
import CreateUpdateBankAccountModal from "components/BankAccount/CreateUpdateBankAccountModal";
import Can from "components/Shared/Can";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  BankAccountFragment,
  Companies,
  CompanyVendorPartnerships,
  useChangeBankAccountMutation,
  useCompanyBankAccountsQuery,
} from "generated/graphql";
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

function BankAccount(props: {
  companyId: Companies["id"];
  companyVendorPartnershipId: CompanyVendorPartnerships["id"];
  bankAccount?: BankAccountFragment | null;
}) {
  const classes = useStyles();
  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const { data, refetch } = useCompanyBankAccountsQuery({
    variables: {
      companyId: props.companyId,
    },
  });
  const [changeBankAccount] = useChangeBankAccountMutation();

  const [addingNewAccount, setAddingNewAccount] = useState(false);

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" mt={1}>
        {data?.bank_accounts.length ? (
          <Box mr={1}>
            <Select
              className={classes.selectInput}
              variant="outlined"
              value={props.bankAccount?.id || "None"}
              onChange={({ target: { value } }) => {
                changeBankAccount({
                  variables: {
                    bankAccountId: value === "None" ? null : value,
                    companyVendorPartnershipId:
                      props.companyVendorPartnershipId,
                  },
                  optimisticResponse: {
                    update_company_vendor_partnerships_by_pk: {
                      id: props.companyVendorPartnershipId,
                      vendor_bank_account: data.bank_accounts.find(
                        (bank) => bank.id === value
                      ),
                    },
                  },
                });
              }}
            >
              <MenuItem key="none" value="None">
                {`None (${data.bank_accounts.length} available)`}
              </MenuItem>
              {data.bank_accounts.map((bank_account) => {
                return (
                  <MenuItem key={bank_account.id} value={bank_account.id}>
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
            companyId={props.companyId}
            existingBankAccount={null}
            handleClose={() => {
              refetch();
              setAddingNewAccount(false);
            }}
          />
        )}
        {props.bankAccount && (
          <Box width="fit-content" mt={2}>
            <BankAccountInfoCard
              isCannabisCompliantVisible
              isEditAllowed={check(role, Action.EditBankAccount)}
              isVerificationVisible
              bankAccount={props.bankAccount}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default BankAccount;
