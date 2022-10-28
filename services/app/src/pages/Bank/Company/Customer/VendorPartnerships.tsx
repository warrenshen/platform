import { Box } from "@material-ui/core";
import BankCompanyPage from "pages/Bank/Company/BankCompanyPage";
import CustomerVendorPartnershipsPageContent from "pages/Bank/Company/VendorPartnerships";

export default function BankCompanyCustomerVendorPartnershipsPage() {
  return (
    <BankCompanyPage>
      {({ companyId, productType, isActiveContract }) => (
        <Box width={`calc(100% - 200px)`}>
          <CustomerVendorPartnershipsPageContent companyId={companyId} />
        </Box>
      )}
    </BankCompanyPage>
  );
}
