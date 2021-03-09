import PaymentsDataGrid from "components/Repayment/PaymentsDataGrid";
import Page from "components/Shared/Page";
import { useGetPaymentsSubscription } from "generated/graphql";

function BankPaymentsPage() {
  const { data } = useGetPaymentsSubscription();

  const payments = data?.payments || [];

  return (
    <Page appBarTitle={"Payments - All"}>
      <PaymentsDataGrid
        isCompanyVisible
        enableSelect={false}
        payments={payments}
        customerSearchQuery={""}
        onClickCustomerName={() => {}}
      />
    </Page>
  );
}

export default BankPaymentsPage;
