import BespokeBankAssignment from "components/Shared/BespokeBankAssignment";
import {
  BankAccountFragment,
  useAssignCollectionsBespokeBankAccountMutation,
} from "generated/graphql";
import useCompanyContext from "hooks/useCustomerContext";

interface Props {
  assignedBespokeBankAccount?: BankAccountFragment;
}

function CollectionsBank(props: Props) {
  const companyId = useCompanyContext();
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
            companyId,
          },
          optimisticResponse: {
            update_companies_by_pk: {
              id: companyId,
              collections_bespoke_bank_account_id: bankAccount?.id,
              collections_bespoke_bank_account: bankAccount,
            },
          },
        });
      }}
    ></BespokeBankAssignment>
  );
}

export default CollectionsBank;
