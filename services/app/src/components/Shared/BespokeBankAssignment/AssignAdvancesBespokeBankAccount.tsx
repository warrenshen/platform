import BespokeBankAssignment from "components/Shared/BespokeBankAssignment";
import {
  BankAccountFragment,
  CompanySettings,
  useAssignAdvancesBespokeBankAccountMutation,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";

interface Props {
  companySettingsId: CompanySettings["id"];
  assignedBespokeBankAccount?: BankAccountFragment;
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
      label="Advances Bank Account"
      onAssignment={async (bankAccount: BankAccountFragment | null) => {
        const response = await assignAdvancesBespokeBankAccount({
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
