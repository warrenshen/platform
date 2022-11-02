import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core";
import BankAccountInfoCardContent from "components/BankAccount/BankAccountInfoCardContent";
import {
  BankAccounts,
  Companies,
  PaymentsInsertInput,
  useGetBankAccountsByCompanyIdQuery,
} from "generated/graphql";

import CardContainer from "../Card/CardContainer";

interface Props {
  companyId: Companies["id"] | null;
  payment: PaymentsInsertInput;
  onCompanyBankAccountSelection: (id: BankAccounts["id"]) => void;
}

export default function CompanyBank({
  companyId,
  payment,
  onCompanyBankAccountSelection,
}: Props) {
  const { data } = useGetBankAccountsByCompanyIdQuery({
    fetchPolicy: "network-only",
    variables: {
      companyId,
    },
  });

  if (!data || !data.bank_accounts) {
    return null;
  }

  const companyBankAccount = data.bank_accounts.find(
    (bank_account) => bank_account.id === payment.company_bank_account_id
  );

  return (
    <Box display="flex" flexDirection="column">
      <FormControl>
        <InputLabel id="select-bank-account-label">Bank Account</InputLabel>
        <Select
          id="select-bank-account"
          labelId="select-bank-account-label"
          data-cy="select-bank-account-label"
          value={payment.company_bank_account_id || ""}
          onChange={({ target: { value } }) =>
            onCompanyBankAccountSelection(value || null)
          }
        >
          <MenuItem key={"none"} value={""}>
            None
          </MenuItem>
          {data.bank_accounts.map((bank_account, index) => (
            <MenuItem
              key={bank_account.id}
              value={bank_account.id}
              data-cy={`select-bank-account-label-item-${index}`}
            >
              {`${bank_account.bank_name}: ${bank_account.account_title} (${bank_account.account_type})`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {companyBankAccount && (
        <Box mt={2}>
          <CardContainer>
            <BankAccountInfoCardContent bankAccount={companyBankAccount} />
          </CardContainer>
        </Box>
      )}
    </Box>
  );
}
