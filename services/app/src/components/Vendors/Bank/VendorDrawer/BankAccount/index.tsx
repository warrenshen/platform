import { Box, Button, makeStyles, MenuItem, Select } from "@material-ui/core";
import AccountInfoCard from "components/Shared/BankAccount/AccountInfoCard";
import AccountModal from "components/Shared/BankAccount/AccountModal";
import {
  BankAccountFragment,
  Companies,
  CompanyVendorPartnerships,
  useChangeBankAccountMutation,
  useCompanyBankAccountsQuery,
} from "generated/graphql";
import { useState } from "react";

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

  const [changeBankAccount] = useChangeBankAccountMutation();
  const { data } = useCompanyBankAccountsQuery({
    variables: {
      companyId: props.companyId,
    },
  });

  const [addingNewAccount, setAddingNewAccount] = useState(false);

  return (
    <>
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
                    {`${bank_account.bank_name} (${bank_account.account_type})`}
                  </MenuItem>
                );
              })}
            </Select>
          </Box>
        ) : null}
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
      </Box>
      <Box mb={3}>
        {addingNewAccount && (
          <AccountModal
            companyId={props.companyId}
            handleClose={() => setAddingNewAccount(false)}
          ></AccountModal>
        )}
        {props.bankAccount && (
          <Box width="fit-content" mt={2}>
            <AccountInfoCard bankAccount={props.bankAccount}></AccountInfoCard>
          </Box>
        )}
      </Box>
    </>
  );
}

export default BankAccount;
