import { Box } from "@material-ui/core";
import BankCompanyPage from "pages/Bank/Company/BankCompanyPage";
import CustomerVendorsPageContent from "pages/Customer/Vendors/VendorsPageContent";

export default function BankCompanyCustomerVendorsPage() {
  return (
    <BankCompanyPage>
      {({ companyId, productType, isActiveContract }) => (
        <Box width={`calc(100% - 200px)`}>
          <CustomerVendorsPageContent
            companyId={companyId}
            productType={productType}
            isActiveContract={isActiveContract}
          />
        </Box>
      )}
    </BankCompanyPage>
  );
}
