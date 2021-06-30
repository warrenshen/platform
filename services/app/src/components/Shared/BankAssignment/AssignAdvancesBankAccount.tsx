import CompanyBankAssignment from "components/Shared/BankAssignment/CompanyBankAssignment";
import {
  BankAccountLimitedFragment,
  Companies,
  CompanySettings,
  useAssignAdvancesBankAccountMutation,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";

interface Props {
  companyId: Companies["id"];
  companySettingsId: CompanySettings["id"];
  assignedBankAccount: BankAccountLimitedFragment | null;
  handleDataChange: () => void;
}

export default function AssignAdvancesBankAccount(props: Props) {
  const snackbar = useSnackbar();

  const [assignAdvancesBankAccount] = useAssignAdvancesBankAccountMutation();

  return (
    <CompanyBankAssignment
      {...props}
      label="Advances Bank Account"
      onAssignment={async (bankAccount: BankAccountLimitedFragment | null) => {
        const response = await assignAdvancesBankAccount({
          variables: {
            bankAccountId: bankAccount?.id,
            companySettingsId: props.companySettingsId,
          },
        });
        if (!response.data?.update_company_settings_by_pk) {
          snackbar.showError(`Could not assign advances bank account.`);
        } else {
          snackbar.showSuccess("Advances bank account assigned.");
          props.handleDataChange();
        }
      }}
    />
  );
}
