import BankCompanyPage from "pages/Bank/Company/BankCompanyPage";
import CustomerVendorsPageContent from "pages/Customer/Vendors/VendorsPageContent";

export default function BankCompanyCustomerVendorsPage() {
  return (
    <BankCompanyPage>
      {({ companyId, productType, isActiveContract }) => (
        <CustomerVendorsPageContent
          companyId={companyId}
          productType={productType}
          isActiveContract={isActiveContract}
        />
      )}
    </BankCompanyPage>
  );
}
