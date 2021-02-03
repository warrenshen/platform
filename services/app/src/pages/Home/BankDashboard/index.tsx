import { useState } from "react";
import { useTitle } from "react-use";
import { useAllPurchaseOrderLoansForBankQuery } from "generated/graphql";
import useAppBarTitle from "hooks/useAppBarTitle";
import LoansTable from "./LoansTable";

function BankDashboard() {
  useTitle("Dashboard | Bespoke");
  useAppBarTitle("Dashboard");
  const [loansTableFullView, setLoansTableFullView] = useState(false);

  const { data, error } = useAllPurchaseOrderLoansForBankQuery();

  if (error) {
    alert("Error querying purchase order loans. " + error);
  }

  const purchaseOrderLoans = data?.purchase_order_loans || [];

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
