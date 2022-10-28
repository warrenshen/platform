import BankCompanyPage from "pages/Bank/Company/BankCompanyPage";
import CustomerVendorPartnershipsPageContent from "pages/Bank/Company/VendorPartnerships";

export default function BankCompanyCustomerVendorPartnershipsPage() {
  return (
    <BankCompanyPage>
      {({ companyId, productType, isActiveContract }) => (
        <CustomerVendorPartnershipsPageContent companyId={companyId} />
      )}
    </BankCompanyPage>
  );
}
