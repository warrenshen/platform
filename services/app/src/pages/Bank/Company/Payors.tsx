import CustomerPayorsPageContent from "pages/Customer/Payors/PayorsPageContent";

interface Props {
  companyId: string;
}

export default function BankCustomerPayorsSubpage({ companyId }: Props) {
  return <CustomerPayorsPageContent companyId={companyId} />;
}
