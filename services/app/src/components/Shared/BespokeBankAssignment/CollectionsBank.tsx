import BespokeBankAssignment from "components/Shared/BespokeBankAssignment";
import {
  BankAccountFragment,
  CompanySettings,
  CompanySettingsFragment,
  CompanySettingsFragmentDoc,
  useAssignCollectionsBespokeBankAccountMutation,
} from "generated/graphql";

interface Props {
  companySettingsId: CompanySettings["id"];
  assignedBespokeBankAccount?: BankAccountFragment;
}

function CollectionsBank(props: Props) {
  const [
    assignCollectionsBankAccount,
  ] = useAssignCollectionsBespokeBankAccountMutation();

  return (
    <BespokeBankAssignment
      {...props}
      label="Collections Bank Account"
      onAssignment={(bankAccount: BankAccountFragment | null) => {
        assignCollectionsBankAccount({
          variables: {
            bankAccountId: bankAccount?.id,
            companySettingsId: props.companySettingsId,
          },
          optimisticResponse: {
            update_company_settings_by_pk: {
              id: props.companySettingsId,
              collections_bespoke_bank_account: bankAccount,
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
                collections_bespoke_bank_account:
                  optimisticResponse?.update_company_settings_by_pk
                    ?.collections_bespoke_bank_account,
              },
            });
          },
        });
      }}
    />
  );
}

export default CollectionsBank;
