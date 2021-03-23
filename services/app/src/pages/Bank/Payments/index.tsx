import RepaymentsDataGrid from "components/Repayment/RepaymentsDataGrid";
import Page from "components/Shared/Page";
import { useGetPaymentsSubscription } from "generated/graphql";

function BankPaymentsPage() {
  const { data } = useGetPaymentsSubscription();

  const payments = data?.payments || [];

  return (
    <Page appBarTitle={"Payments - All"}>
      <RepaymentsDataGrid
        isCompanyVisible
        isExcelExport
        enableSelect={false}
        payments={payments}
        customerSearchQuery={""}
        onClickCustomerName={() => {}}
      />
    </Page>
  );
}

export default BankPaymentsPage;
