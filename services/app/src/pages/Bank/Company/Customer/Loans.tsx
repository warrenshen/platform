import { Box } from "@material-ui/core";
import BankCompanyPage from "pages/Bank/Company/BankCompanyPage";
import CustomerLoansPageContent from "pages/Customer/LoansNew/LoansPageContentNew";

export default function BankCompanyCustomerLoansPage() {
  return (
    <BankCompanyPage>
      {({ companyId, productType, isActiveContract }) => (
        <Box width={`calc(100% - 200px)`}>
          <CustomerLoansPageContent
            companyId={companyId}
            productType={productType}
            isActiveContract={isActiveContract}
          />
        </Box>
      )}
    </BankCompanyPage>
  );
}
