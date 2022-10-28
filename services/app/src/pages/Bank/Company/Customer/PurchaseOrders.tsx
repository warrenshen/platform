import { Box } from "@material-ui/core";
import BankCompanyPage from "pages/Bank/Company/BankCompanyPage";
import CustomerPurchaseOrdersPageContent from "pages/Customer/PurchaseOrders/PurchaseOrdersPageContentNew";

export default function BankCompanyCustomerPurchaseOrderPage() {
  return (
    <BankCompanyPage>
      {({ companyId, productType, isActiveContract }) => (
        <Box width={`calc(100% - 200px)`}>
          <CustomerPurchaseOrdersPageContent
            companyId={companyId}
            productType={productType}
            isActiveContract={isActiveContract}
          />
        </Box>
      )}
    </BankCompanyPage>
  );
}
