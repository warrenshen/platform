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

export default function AssignCollectionsBespokeBankAccount(props: Props) {
  const snackbar = useSnackbar();

  const [
    assignCollectionsBankAccount,
  ] = useAssignCollectionsBespokeBankAccountMutation();

  return (
    <BespokeBankAssignment
      {...props}
      label="Collections BF Bank Account"
      onAssignment={async (bankAccount: BankAccountFragment | null) => {
        const response = await assignCollectionsBankAccount({
          variables: {
            bankAccountId: bankAccount?.id,
            companySettingsId: props.companySettingsId,
          },
        });
        if (!response.data?.update_company_settings_by_pk) {
          snackbar.showError(
            `Could not assign collections Bespoke Financial bank account.`
          );
        } else {
          snackbar.showSuccess(
            "Collections Bespoke Financial bank account assigned."
          );
          props.handleDataChange();
        }
      }}
    />
  );
}
