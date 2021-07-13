import { Companies } from "generated/graphql";
import CustomerVendorsPageContent from "pages/Customer/Vendors/VendorsPageContent";

interface Props {
  companyId: Companies["id"];
}

export default function BankCustomerVendorsSubpage({ companyId }: Props) {
  return <CustomerVendorsPageContent companyId={companyId} />;
}
