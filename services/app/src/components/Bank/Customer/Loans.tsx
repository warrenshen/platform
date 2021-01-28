import PurchaseOrderLoansView from "components/PurchaseOrderLoans/PurchaseOrderLoansView";
import { usePurchaseOrderLoansForBankQuery } from "generated/graphql";
import useCompanyContext from "hooks/useCompanyContext";

function Loans() {
  const companyId = useCompanyContext();

  const { data, refetch, error } = usePurchaseOrderLoansForBankQuery({
    variables: {
      companyId,
    },
  });
  if (error) {
    alert("Error querying purchase orders. " + error);
  }

  const purchaseOrderLoans = data?.purchase_order_loans || [];

  return (
    <PurchaseOrderLoansView
      purchaseOrderLoans={purchaseOrderLoans}
      refetch={refetch}
    ></PurchaseOrderLoansView>
  );
}

export default Loans;
