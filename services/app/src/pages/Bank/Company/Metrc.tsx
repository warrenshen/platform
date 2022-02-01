import { Companies } from "generated/graphql";
import BankCompanyMetrcPageContent from "pages/Bank/Company/Metrc/MetrcPageContent";

interface Props {
  companyId: Companies["id"];
}

export default function BankCustomerMetrcSubPage({ companyId }: Props) {
  return <BankCompanyMetrcPageContent companyId={companyId} />;
}
