import Loans from "components/PurchaseOrderLoans";
import Page from "components/Shared/Page";
import useAppBarTitle from "hooks/useAppBarTitle";
import React from "react";
import { useTitle } from "react-use";

function LoansPage() {
  useTitle("Loans | Bespoke");
  useAppBarTitle("Loans");

  return (
    <Page>
      <Loans></Loans>
    </Page>
  );
}

export default LoansPage;
