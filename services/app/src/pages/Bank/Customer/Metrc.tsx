import { Companies } from "generated/graphql";
import CustomerMetrcPageContent from "pages/Customer/Metrc/MetrcPageContent";

interface Props {
  companyId: Companies["id"];
}

export default function BankCustomerMetrcSubPage({ companyId }: Props) {
  return <CustomerMetrcPageContent companyId={companyId} />;
}
