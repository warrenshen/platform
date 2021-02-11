import Page from "components/Shared/Page";
import PaymentsDataGrid from "components/Shared/Payments/PaymentsDataGrid";
import { useGetPaymentsQuery } from "generated/graphql";

function BankPaymentsPage() {
  const { data } = useGetPaymentsQuery();

  const payments = data?.payments || [];

  return (
    <Page appBarTitle={"Payments"}>
      <PaymentsDataGrid
        payments={payments}
        customerSearchQuery={""}
        onClickCustomerName={() => {}}
      ></PaymentsDataGrid>
    </Page>
  );
}

export default BankPaymentsPage;
