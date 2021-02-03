import {
  LoanFragment,
  useAllPurchaseOrderLoansForBankQuery,
} from "generated/graphql";
import useAppBarTitle from "hooks/useAppBarTitle";
import { useState } from "react";
import { useTitle } from "react-use";
import LoansTable from "./LoansTable";

function BankDashboard() {
  useTitle("Dashboard | Bespoke");
  useAppBarTitle("Dashboard");
  const [loansTableFullView, setLoansTableFullView] = useState(false);

  const { data, error } = useAllPurchaseOrderLoansForBankQuery();

  if (error) {
    alert("Error querying purchase order loans. " + error);
  }

  const purchaseOrderLoans = (data?.loans || []) as LoanFragment[];

  return (
    <>
      <LoansTable
        purchaseOrderLoans={purchaseOrderLoans}
        fullView={loansTableFullView}
        onFullViewClick={() => setLoansTableFullView(!loansTableFullView)}
      ></LoansTable>
      {!loansTableFullView && "Next table in dashboard"}
    </>
  );
}

export default BankDashboard;
