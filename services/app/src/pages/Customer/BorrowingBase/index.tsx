import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import BorrowingBasePageContent from "pages/Customer/BorrowingBase/BorrowingBasePageContent";
import { useContext } from "react";

export default function CustomerBorrowingBasePage() {
  const {
    user: { companyId, productType },
  } = useContext(CurrentUserContext);
  return (
    <Page appBarTitle={"Borrowing Base"}>
      {companyId && productType && (
        <BorrowingBasePageContent
          companyId={companyId}
          productType={productType}
        />
      )}
    </Page>
  );
}
