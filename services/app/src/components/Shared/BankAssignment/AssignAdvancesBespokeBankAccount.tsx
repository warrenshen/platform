import BespokeBankAssignment from "components/Shared/BankAssignment/BespokeBankAssignment";
import {
  BankAccountFragment,
  CompanySettings,
  useAssignAdvancesBespokeBankAccountMutation,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";

interface Props {
  companySettingsId: CompanySettings["id"];
  assignedBespokeBankAccount: BankAccountFragment | null;
  handleDataChange: () => void;
}

export default function AssignAdvancesBespokeBankAccount(props: Props) {
  const snackbar = useSnackbar();

  const [
    assignAdvancesBespokeBankAccount,
  ] = useAssignAdvancesBespokeBankAccountMutation();

  return (
    <BespokeBankAssignment
      {...props}
      label="Advances BF Bank Account"
      onAssignment={async (bankAccount: BankAccountFragment | null) => {
        const response = await assignAdvancesBespokeBankAccount({
          variables: {
            bankAccountId: bankAccount?.id,
            companySettingsId: props.companySettingsId,
          },
        });
        if (!response.data?.update_company_settings_by_pk) {
          snackbar.showError(
            `Could not assign advances Bespoke Financial bank account.`
          );
        } else {
          snackbar.showSuccess(
            "Advances Bespoke Financial bank account assigned."
          );
          props.handleDataChange();
        }
      }}
    />
  );
}
