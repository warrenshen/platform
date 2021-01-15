import BespokeBankAssignment from "components/Shared/BespokeBankAssignment";
import {
  BankAccountFragment,
  Companies,
  CompanyFragment,
  CompanyFragmentDoc,
  useAssignAdvancesBespokeBankAccountMutation,
} from "generated/graphql";

interface Props {
  companyId: Companies["id"];
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
            companyId: props.companyId,
          },
          optimisticResponse: {
            update_companies_by_pk: {
              id: props.companyId,
              advances_bespoke_bank_account: bankAccount,
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
                advances_bespoke_bank_account:
                  optimisticResponse?.update_companies_by_pk
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
