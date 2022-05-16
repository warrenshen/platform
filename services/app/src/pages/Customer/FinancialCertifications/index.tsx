import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import FinancialCertificationsPageContent from "pages/Customer/FinancialCertifications/FinancialCertificationsPageContent";
import { useContext } from "react";

export default function CustomerFinancialCertificationsPage() {
  const {
    user: { companyId, productType },
  } = useContext(CurrentUserContext);
  return (
    <Page appBarTitle={"Financial Certifications"}>
      {companyId && productType && (
        <FinancialCertificationsPageContent
          companyId={companyId}
          productType={productType}
        />
      )}
    </Page>
  );
}
