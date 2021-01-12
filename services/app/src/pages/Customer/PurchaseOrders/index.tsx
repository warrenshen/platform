import PurchaseOrders from "components/Shared/PurchaseOrders";
import useAppBarTitle from "hooks/useAppBarTitle";
import React from "react";
import { useTitle } from "react-use";

function PurchaseOrdersPage() {
  useTitle("Purchase Orders | Bespoke");
  useAppBarTitle("Purchase Orders");

  return <PurchaseOrders></PurchaseOrders>;
}

export default PurchaseOrdersPage;
