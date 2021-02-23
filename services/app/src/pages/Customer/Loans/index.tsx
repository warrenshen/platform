import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { ProductTypeEnum } from "generated/graphql";
import LineOfCreditLoans from "pages/Customer/Loans/CustomerLineOfCreditLoansPage";
import PurchaseOrderLoans from "pages/Customer/Loans/CustomerPurchaseOrderLoansPage";
import React, { useContext } from "react";

function CustomerLoansPage() {
  const {
    user: { productType },
  } = useContext(CurrentUserContext);

  if (productType === ProductTypeEnum.InventoryFinancing) {
    return (
      <Page appBarTitle={"Loans"}>
        <PurchaseOrderLoans />
      </Page>
    );
  } else if (productType === ProductTypeEnum.LineOfCredit) {
    return (
      <Page appBarTitle={"Loans"}>
        <LineOfCreditLoans />
      </Page>
    );
  } else {
    return null;
  }
}

export default CustomerLoansPage;
