import BankCompanyPage from "pages/Bank/Company/BankCompanyPage";
import CustomerPayorsPageContent from "pages/Customer/Payors/PayorsPageContent";

export default function BankCompanyCustomerPayorsPage() {
  return (
    <BankCompanyPage>
      {({ companyId, productType, isActiveContract }) => (
        <CustomerPayorsPageContent
          companyId={companyId}
          isActiveContract={isActiveContract}
        />
      )}
    </BankCompanyPage>
  );
}
