import {
  LoanFragment,
  useAllPurchaseOrderLoansForBankQuery,
  RequestStatusEnum,
} from "generated/graphql";
import useAppBarTitle from "hooks/useAppBarTitle";
import { bankRoutes } from "lib/routes";
import { useTitle } from "react-use";
import LoansTable from "./LoansTable";

function BankDashboard() {
  useTitle("Dashboard | Bespoke");
  useAppBarTitle("Dashboard");

  const { data, error } = useAllPurchaseOrderLoansForBankQuery();

  if (error) {
    alert("Error querying purchase order loans. " + error);
  }

  const purchaseOrderLoans = (data?.loans || []) as LoanFragment[];

  return (
    <>
      <LoansTable
        purchaseOrderLoans={purchaseOrderLoans}
        tableName={"All Loans"}
        loansPastDue={false}
        filterByStatus={RequestStatusEnum.ApprovalRequested}
      ></LoansTable>
      <LoansTable
        purchaseOrderLoans={purchaseOrderLoans}
        tableName={"Loans Maturing in 14 Days"}
        routeToTablePage={bankRoutes.loansMaturing}
        loansPastDue={false}
        matureDays={14}
      ></LoansTable>
      <LoansTable
        purchaseOrderLoans={purchaseOrderLoans}
        tableName={"Loans Past Due"}
        routeToTablePage={bankRoutes.loansPastDue}
        loansPastDue={true}
      ></LoansTable>
    </>
  );
}

export default BankDashboard;
