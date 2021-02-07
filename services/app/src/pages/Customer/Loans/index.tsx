import LineOfCreditLoans from "components/Loans/LineOfCredit";
import PurchaseOrderLoans from "components/Loans/PurchaseOrder";
import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { ProductTypeEnum } from "generated/graphql";
import useAppBarTitle from "hooks/useAppBarTitle";
import React, { useContext } from "react";
import { useTitle } from "react-use";

function CustomerLoansPage() {
  useTitle("Loans | Bespoke");
  useAppBarTitle("Loans");

  const {
    user: { productType },
  } = useContext(CurrentUserContext);

  if (productType === ProductTypeEnum.InventoryFinancing) {
    return (
      <Page>
        <PurchaseOrderLoans></PurchaseOrderLoans>
      </Page>
    );
  } else if (productType === ProductTypeEnum.LineOfCredit) {
    return (
      <Page>
        <LineOfCreditLoans></LineOfCreditLoans>
      </Page>
    );
  } else {
    return null;
  }
}

export default CustomerLoansPage;
