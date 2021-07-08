import CompanyBankAssignment from "components/Shared/BankAssignment/CompanyBankAssignment";
import {
  BankAccountLimitedFragment,
  Companies,
  CompanySettings,
  useAssignCollectionsBankAccountMutation,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";

interface Props {
  companyId: Companies["id"];
  companySettingsId: CompanySettings["id"];
  assignedBankAccount: BankAccountLimitedFragment | null;
  handleDataChange: () => void;
}

export default function AssignCollectionsBankAccount(props: Props) {
  const snackbar = useSnackbar();

  const [
    assignCollectionsBankAccount,
  ] = useAssignCollectionsBankAccountMutation();

  return (
    <CompanyBankAssignment
      {...props}
      label="Repayments Bank Account"
      onAssignment={async (bankAccount: BankAccountLimitedFragment | null) => {
        const response = await assignCollectionsBankAccount({
          variables: {
            bankAccountId: bankAccount?.id,
            companySettingsId: props.companySettingsId,
          },
        });
        if (!response.data?.update_company_settings_by_pk) {
          snackbar.showError(`Could not assign repayments bank account.`);
        } else {
          snackbar.showSuccess("Repayments bank account assigned.");
          props.handleDataChange();
        }
      }}
    />
  );
}
