import { Box } from "@material-ui/core";
import BankCompanyPage from "pages/Bank/Company/BankCompanyPage";
import CustomerInvoicesPageContent from "pages/Customer/Invoices/InvoicesPageContent";

export default function BankCompanyCustomerInvoicesPage() {
  return (
    <BankCompanyPage>
      {({ companyId, productType, isActiveContract }) => (
        <Box width={`calc(100% - 200px)`}>
          <CustomerInvoicesPageContent
            companyId={companyId}
            productType={productType}
          />
        </Box>
      )}
    </BankCompanyPage>
  );
}
