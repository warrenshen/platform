import { Box } from "@material-ui/core";
import BankCompanyPage from "pages/Bank/Company/BankCompanyPage";
import CustomerReportsPageContent from "pages/Customer/Reports/ReportsPageContent";

export default function BankCompanyCustomerReportsPage() {
  return (
    <BankCompanyPage>
      {({ companyId, productType, isActiveContract }) => (
        <Box width={`calc(100% - 200px)`}>
          <CustomerReportsPageContent
            companyId={companyId}
            productType={productType}
          />
        </Box>
      )}
    </BankCompanyPage>
  );
}
