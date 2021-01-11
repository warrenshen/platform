import Loans from "components/Loans";
import useAppBarTitle from "hooks/useAppBarTitle";
import React from "react";
import { useTitle } from "react-use";

function LoansPage() {
  useTitle("Loans | Bespoke");
  useAppBarTitle("Loans");

  return <Loans></Loans>;
}

export default LoansPage;
