import BespokeBankAssignment from "components/Shared/BespokeBankAssignment";
import {
  BankAccountFragment,
  Companies,
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
              advances_bespoke_bank_account_id: bankAccount?.id,
              advances_bespoke_bank_account: bankAccount,
            },
          },
        });
      }}
    ></BespokeBankAssignment>
  );
}

export default AdvancesBank;
