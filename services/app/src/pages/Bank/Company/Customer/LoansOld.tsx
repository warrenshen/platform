import BankCompanyPage from "pages/Bank/Company/BankCompanyPage";
import CustomerLoansPageContent from "pages/Customer/Loans/LoansPageContent";

export default function BankCompanyCustomerLoansPage() {
  return (
    <BankCompanyPage>
      {({ companyId, productType, isActiveContract }) => (
        <CustomerLoansPageContent
          companyId={companyId}
          productType={productType}
          isActiveContract={isActiveContract}
        />
      )}
    </BankCompanyPage>
  );
}
