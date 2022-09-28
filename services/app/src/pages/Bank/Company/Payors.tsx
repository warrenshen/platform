import CustomerPayorsPageContent from "pages/Customer/Payors/PayorsPageContent";

interface Props {
  companyId: string;
  isActiveContract: boolean;
}

export default function BankCustomerPayorsSubpage({
  companyId,
  isActiveContract,
}: Props) {
  return (
    <CustomerPayorsPageContent
      companyId={companyId}
      isActiveContract={isActiveContract}
    />
  );
}
