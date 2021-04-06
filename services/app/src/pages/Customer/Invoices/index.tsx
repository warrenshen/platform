import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import CustomerInvoicesPageContent from "pages/Customer/Invoices/InvoicesPageContent";
import { useContext } from "react";

export default function CustomerInvoicesPages() {
  const {
    user: { companyId, productType },
  } = useContext(CurrentUserContext);

  return (
    <Page appBarTitle="Invoices">
      {companyId && productType && (
        <CustomerInvoicesPageContent
          companyId={companyId}
          productType={productType}
        />
      )}
    </Page>
  );
}
