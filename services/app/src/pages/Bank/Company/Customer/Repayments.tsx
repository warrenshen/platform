import BankCompanyPage from "pages/Bank/Company/BankCompanyPage";
import CustomerRepaymentsPageContent from "pages/Customer/Repayments/RepaymentsPageContent";

export default function BankCompanyCustomerRepaymentsPage() {
  return (
    <BankCompanyPage>
      {({ companyId, productType, isActiveContract }) => (
        <CustomerRepaymentsPageContent
          companyId={companyId}
          productType={productType}
        />
      )}
    </BankCompanyPage>
  );
}
