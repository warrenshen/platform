import CustomerPaymentsPageContent from "pages/Customer/Payments/PaymentsPageContent";

interface Props {
  companyId: string;
}

export default function BankCustomerPaymentsSubpage({ companyId }: Props) {
  return <CustomerPaymentsPageContent companyId={companyId} />;
}
