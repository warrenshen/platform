import { Companies } from "generated/graphql";
import CurrentCustomerProvider from "contexts/CurrentCustomerProvider";
import CustomerReportsPageContent from "pages/Customer/Reports/ReportsPageContent";

interface Props {
  companyId: Companies["id"];
}

export default function BankCustomerLoansSubpage({ companyId }: Props) {
  return (
    <CurrentCustomerProvider companyId={companyId}>
      <CustomerReportsPageContent companyId={companyId} />
    </CurrentCustomerProvider>
  );
}
