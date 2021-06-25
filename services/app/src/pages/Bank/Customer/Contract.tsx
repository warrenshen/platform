import { Companies } from "generated/graphql";
import CustomerContractPageContent from "pages/Customer/Contract/ContractPageContent";

interface Props {
  companyId: Companies["id"];
}

export default function BankCustomerContractSubpage({ companyId }: Props) {
  return <CustomerContractPageContent companyId={companyId} />;
}
