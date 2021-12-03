import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import CustomerVendorsPageContent from "pages/Customer/Vendors/VendorsPageContent";
import { useContext } from "react";

export default function CustomerVendorsPage() {
  const {
    user: { companyId, productType },
  } = useContext(CurrentUserContext);

  return (
    <Page appBarTitle={"Vendors"}>
      {companyId && productType && (
        <CustomerVendorsPageContent
          companyId={companyId}
          productType={productType}
        />
      )}
    </Page>
  );
}
