import BespokeBankAssignment from "components/Shared/BespokeBankAssignment";
import {
  BankAccountFragment,
  CompanySettings,
  useAssignCollectionsBespokeBankAccountMutation,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";

interface Props {
  companySettingsId: CompanySettings["id"];
  assignedBespokeBankAccount?: BankAccountFragment;
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
      label="Collections Bank Account"
      onAssignment={async (bankAccount: BankAccountFragment | null) => {
        const response = await assignCollectionsBankAccount({
          variables: {
            bankAccountId: bankAccount?.id,
            companySettingsId: props.companySettingsId,
          },
        });
        if (!response.data?.update_company_settings_by_pk) {
          snackbar.showError(`Could not assign collections bank account.`);
        } else {
          snackbar.showSuccess("Collections bank account assigned.");
          props.handleDataChange();
        }
      }}
    />
  );
}
