import Page from "components/Shared/Page";
import PaymentsDataGrid from "components/Shared/Payments/PaymentsDataGrid";
import { useGetPaymentsQuery } from "generated/graphql";
import useAppBarTitle from "hooks/useAppBarTitle";
import { useTitle } from "react-use";

function BankPaymentsPage() {
  useTitle("Payments | Bespoke");
  useAppBarTitle("Payments");

  const { data } = useGetPaymentsQuery();

  const payments = data?.payments || [];

  return (
    <Page>
      <PaymentsDataGrid
        payments={payments}
        customerSearchQuery={""}
        onClickCustomerName={() => {}}
      ></PaymentsDataGrid>
    </Page>
  );
}

export default BankPaymentsPage;
