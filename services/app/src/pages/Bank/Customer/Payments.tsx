import CustomerRepaymentsPageContent from "pages/Customer/Repayments/RepaymentsPageContent";

interface Props {
  companyId: string;
}

export default function BankCustomerPaymentsSubpage({ companyId }: Props) {
  return <CustomerRepaymentsPageContent companyId={companyId} />;
}
