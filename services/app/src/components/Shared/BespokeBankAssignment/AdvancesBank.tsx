import BespokeBankAssignment from "components/Shared/BespokeBankAssignment";
import {
  BankAccountFragment,
  useAssignAdvancesBespokeBankAccountMutation,
} from "generated/graphql";
import useCompanyContext from "hooks/useCustomerContext";

interface Props {
  assignedBespokeBankAccount?: BankAccountFragment;
}

function AdvancesBank(props: Props) {
  const companyId = useCompanyContext();
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
            companyId,
          },
          optimisticResponse: {
            update_companies_by_pk: {
              id: companyId,
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
