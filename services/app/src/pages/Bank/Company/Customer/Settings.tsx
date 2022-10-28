import { Box } from "@material-ui/core";
import BankCompanyPage from "pages/Bank/Company/BankCompanyPage";
import CustomerSettingsPageContent from "pages/Bank/Company/Settings";

export default function BankCompanyCustomerSettingsPage() {
  return (
    <BankCompanyPage>
      {({ companyId, productType, isActiveContract }) => (
        <Box width={`calc(100% - 200px)`}>
          <CustomerSettingsPageContent companyId={companyId} />
        </Box>
      )}
    </BankCompanyPage>
  );
}
