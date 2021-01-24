import BespokeBankAssignment from "components/Shared/BespokeBankAssignment";
import {
  BankAccountFragment,
  CompanySettings,
  CompanySettingsFragment,
  CompanySettingsFragmentDoc,
  useAssignAdvancesBespokeBankAccountMutation,
} from "generated/graphql";

interface Props {
  companySettingsId: CompanySettings["id"];
  assignedBespokeBankAccount?: BankAccountFragment;
}

function AdvancesBank(props: Props) {
  const [
    assignAdvancesBankAccount,
  ] = useAssignAdvancesBespokeBankAccountMutation();

  return (
    <BespokeBankAssignment
      {...props}
      label="Advances Bank Account"
      onAssignment={(bankAccount: BankAccountFragment | null) => {
        assignAdvancesBankAccount({
          variables: {
            bankAccountId: bankAccount?.id,
            companySettingsId: props.companySettingsId,
          },
          optimisticResponse: {
            update_company_settings_by_pk: {
              id: props.companySettingsId,
              advances_bespoke_bank_account: bankAccount,
            },
          },
          update: (proxy, { data: optimisticResponse }) => {
            const fragmentOptions = {
              fragment: CompanySettingsFragmentDoc,
              fragmentName: "CompanySettings",
              id: `company_settings:${props.companySettingsId}`,
            };
            const data = proxy.readFragment<CompanySettingsFragment>(
              fragmentOptions
            );
            proxy.writeFragment({
              ...fragmentOptions,
              data: {
                ...data,
                advances_bespoke_bank_account:
                  optimisticResponse?.update_company_settings_by_pk
                    ?.advances_bespoke_bank_account,
              },
            });
          },
        });
      }}
    ></BespokeBankAssignment>
  );
}

export default AdvancesBank;
