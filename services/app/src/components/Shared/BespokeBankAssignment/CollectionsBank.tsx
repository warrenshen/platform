import BespokeBankAssignment from "components/Shared/BespokeBankAssignment";
import {
  BankAccountFragment,
  Companies,
  CompanyFragment,
  CompanyFragmentDoc,
  useAssignCollectionsBespokeBankAccountMutation,
} from "generated/graphql";

interface Props {
  companyId: Companies["id"];
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
            companyId: props.companyId,
          },
          optimisticResponse: {
            update_companies_by_pk: {
              id: props.companyId,
              collections_bespoke_bank_account: bankAccount,
            },
          },
          update: (proxy, { data: optimisticResponse }) => {
            const fragmentOptions = {
              fragment: CompanyFragmentDoc,
              fragmentName: "Company",
              id: `companies:${props.companyId}`,
            };
            const data = proxy.readFragment<CompanyFragment>(fragmentOptions);
            proxy.writeFragment({
              ...fragmentOptions,
              data: {
                ...data,
                collections_bespoke_bank_account:
                  optimisticResponse?.update_companies_by_pk
                    ?.collections_bespoke_bank_account,
              },
            });
          },
        });
      }}
    ></BespokeBankAssignment>
  );
}

export default CollectionsBank;
