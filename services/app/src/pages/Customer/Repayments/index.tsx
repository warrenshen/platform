import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import CustomerRepaymentsPageContent from "pages/Customer/Repayments/RepaymentsPageContent";
import { useContext } from "react";

export default function CustomerRepaymentsPage() {
  const {
    user: { companyId, productType },
  } = useContext(CurrentUserContext);

  return (
    <Page appBarTitle={"Repayments"}>
      {companyId && productType && (
        <CustomerRepaymentsPageContent
          companyId={companyId}
          productType={productType}
        />
      )}
    </Page>
  );
}
