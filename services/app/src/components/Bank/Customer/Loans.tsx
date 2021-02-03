import PurchaseOrderLoansView from "components/PurchaseOrderLoans/PurchaseOrderLoansView";
import {
  LoanTypeEnum,
  useLoansByCompanyAndLoanTypeForBankQuery,
} from "generated/graphql";
import useCompanyContext from "hooks/useCompanyContext";
function Loans() {
  const companyId = useCompanyContext();

  const {
    data,
    error,
    loading: isLoansLoading,
    refetch,
  } = useLoansByCompanyAndLoanTypeForBankQuery({
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
    variables: {
      companyId,
      loanType: LoanTypeEnum.PurchaseOrder,
    },
  });
  if (error) {
    alert("Error querying purchase orders. " + error);
  }

  const purchaseOrderLoans = data?.loans || [];

  return (
    <PurchaseOrderLoansView
      isDataLoading={isLoansLoading}
      purchaseOrderLoans={purchaseOrderLoans}
      refetch={refetch}
    ></PurchaseOrderLoansView>
  );
}

export default Loans;
