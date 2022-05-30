import BespokeBankAssignment from "components/Shared/BankAssignment/BespokeBankAssignment";
import {
  BankAccountFragment,
  CompanySettings,
  useAssignCollectionsBespokeBankAccountMutation,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";

interface Props {
  companySettingsId: CompanySettings["id"];
  assignedBespokeBankAccount: BankAccountFragment | null;
  handleDataChange: () => void;
}

export default function AssignCollectionsBespokeBankAccount({
  companySettingsId,
  assignedBespokeBankAccount,
  handleDataChange,
}: Props) {
  const snackbar = useSnackbar();

  const [assignCollectionsBankAccount] =
    useAssignCollectionsBespokeBankAccountMutation();

  return (
    <BespokeBankAssignment
      label="BF Repayments Bank Account"
      assignedBespokeBankAccount={assignedBespokeBankAccount}
      onAssignment={async (bankAccount: BankAccountFragment | null) => {
        const response = await assignCollectionsBankAccount({
          variables: {
            bankAccountId: bankAccount?.id,
            companySettingsId: companySettingsId,
          },
        });
        if (!response.data?.update_company_settings_by_pk) {
          snackbar.showError(
            `Could not assign Bespoke Financial repayments bank account.`
          );
        } else {
          snackbar.showSuccess(
            "Bespoke Financial repayments bank account assigned."
          );
          handleDataChange();
        }
      }}
    />
  );
}
