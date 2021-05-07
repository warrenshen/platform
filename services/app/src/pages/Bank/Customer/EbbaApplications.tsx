import { Companies } from "generated/graphql";
import CustomerEbbaApplicationsPageContent from "pages/Customer/EbbaApplications/EbbaApplicationsPageContent";

interface Props {
  companyId: Companies["id"];
}

export default function BankCustomerEbbaApplicationsSubpage({
  companyId,
}: Props) {
  return <CustomerEbbaApplicationsPageContent companyId={companyId} />;
}
